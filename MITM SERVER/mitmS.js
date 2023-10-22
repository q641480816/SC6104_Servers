import Proxy from 'http-mitm-proxy';
import express from 'express';
import fetch from 'node-fetch';
import http from 'http';
import * as cUtil from './cryptoUtils.js';

const app = express();
const proxy = new Proxy.Proxy();


const RSA_INFO = {};
const cipers = {};
const decryptedMag = {};
let currentSRAkey;


app.get('/getIntercept', (req, res) => {
    res.send({
        RSA_INFO: RSA_INFO,
        cipers: cipers,
        decryptedMag: decryptedMag
    })
});

app.get('/attampNonCoprimeAttact', (req, res) => {
    let RSAList = Object.values(RSA_INFO);
    if (Object.keys(RSA_INFO) < 2 || RSAList[0].e != RSAList[1].e) {
        res.send('Attcak failed: RSA captured less then 2 or No common e');
        return;
    }

    let e = BigInt(RSAList[0].e);
    let p = cUtil.gcd(BigInt(RSAList[0].n), BigInt(RSAList[1].n));
    if (p == 1n) {
        res.send('Attcak failed: n1, n2 are co-prime');
        return;
    }

    //Compute q, d for both;
    let q1 = BigInt(RSA_INFO[Object.keys(RSA_INFO)[0]].n) / p;
    let q2 = BigInt(RSA_INFO[Object.keys(RSA_INFO)[1]].n) / p;

    RSA_INFO[Object.keys(RSA_INFO)[0]] = {
        ...RSA_INFO[Object.keys(RSA_INFO)[0]],
        p: p.toString(),
        q: q1.toString(),
        d: cUtil.computPrivate(e, p, q1).toString()
    }

    RSA_INFO[Object.keys(RSA_INFO)[1]] = {
        ...RSA_INFO[Object.keys(RSA_INFO)[1]],
        p: p.toString(),
        q: q2.toString(),
        d: cUtil.computPrivate(e, p, q2).toString()
    }

    //decypt message
    Object.keys(cipers).forEach(idf => {
        decryptedMag[idf] = cipers[idf].map(c => cUtil.decrypt(c, BigInt(RSA_INFO[idf].d), BigInt(RSA_INFO[idf].n)));
    })

    res.send(decryptedMag);
})



const server = http.Server(app);

server.listen(9002, () => {
    console.log(`[-] Server Listening on Port 9002`);
});

proxy.onRequest(function (ctx, callback) {
    ctx.onRequestData((ctx, chunk, callback) => {
        if (ctx.proxyToServerRequestOptions.path === '/chat') {
            let c = JSON.parse(chunk.toString()).msg;
            console.log("Req: " + c);
            cipers[currentSRAkey].push(c);
            //check if already obtain d
            if(RSA_INFO[currentSRAkey].d !== undefined){
               let msg = cUtil.decrypt(c, BigInt(RSA_INFO[currentSRAkey].d), BigInt(RSA_INFO[currentSRAkey].n))
                decryptedMag[currentSRAkey].push(msg);
                console.log("Decrypted plaintext: " + msg);
            }
        }
        return callback(null, chunk);
    });

    ctx.onResponseData((ctx, chunk, callback) => {
        if (ctx.proxyToServerRequestOptions.path === '/helloServer') {
            console.log("Res: " + chunk.toString());
            let rsa = JSON.parse(chunk.toString());
            RSA_INFO[rsa.e + rsa.n] = rsa;
            currentSRAkey = rsa.e + rsa.n;
            if (cipers[currentSRAkey] === undefined) cipers[currentSRAkey] = [];
            if (decryptedMag[currentSRAkey] === undefined) decryptedMag[currentSRAkey] = [];
        }
        return callback(null, chunk);
    });
    return callback();
});

console.log('begin listening on 9003')
proxy.listen({ port: 9003 });