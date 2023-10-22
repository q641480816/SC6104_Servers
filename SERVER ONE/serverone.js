const express = require('express');
const app = express();
const fs = require('fs');
let forge = require('node-forge');
let math = require('mathjs');
let cUtil = require('./cryptoUtils');

let options = {
    host: "proxy",
    port: 9003,
    path: "http://localhost",
    headers: {
        Host: "localhost"
    }
}

let p1;
let p2;
let p3;
let n1;
let n2;
let e = BigInt(0X1001);
let RSA_SET;
let RSA;

cUtil.getPrime(512)
    .then(res => {
        p1 = res;
        return cUtil.getPrime(512);
    })
    .then(
        res => {
            p2 = res;
            return cUtil.getPrime(512);
        }
    )
    .then(
        res => {
            p3 = res;
            return Promise.resolve();
        }
    )
    .then(res => {
        n1 = BigInt(p1 * p2);
        n2 = BigInt(p1 * p3);
        let d1 = cUtil.computPrivate(e, p1, p2);
        let d2 = cUtil.computPrivate(e, p1, p3);

        RSA_SET = [{
            public: { e: e.toString(), n: n1.toString() },
            p: p1,
            q: p2,
            n: n1,
            e: e,
            d: d1
        }, {
            public: { e: e.toString(), n: n2.toString() },
            p: p1,
            q: p3,
            n: n2,
            e: e,
            d: d2
        }]

        app.use(express.json());
        app.get('/useRSAone', function (req, res) {
            RSA = RSA_SET[0];
            res.send(RSA_SET[0].public);
        });

        app.get('/useRSAtwo', function (req, res) {
            RSA = RSA_SET[1];
            res.send(RSA_SET[1].public);
        });

        app.get('/helloServer', function (req, res) {
            res.send(RSA.public);
        });

        app.post('/chat', function (req, res) {
            let m = cUtil.decrypt(BigInt(req.body.msg), RSA.d, RSA.n);
            console.log("Reveived Chat message: " + req.body.msg + ", decrypted message: " + m);
            res.send({ msg: m.toString() });
        });

        const server = require('http').Server(options, app);
        server.listen(9000, () => {
            console.log(`[-] Server Listening on Port 9000`);
        });
    })
    .catch(err => console.log(err));




