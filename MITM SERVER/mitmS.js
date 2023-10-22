import Proxy from 'http-mitm-proxy';
import express from 'express';
import fetch from 'node-fetch';
import http from 'http';

const app = express();
const proxy = new Proxy.Proxy();


const RSA_INFO = {
    c1: '',
    RSA2: null
}


app.get('/test', function (req, res) {
    console.log('t')
});





const server = http.Server(app);

server.listen(9002, () => {
    console.log(`[-] Server Listening on Port 9002`);
});

proxy.onRequest(function (ctx, callback) {
    ctx.onRequest((ctx, chunk, callback) => {
        console.log("Req: " + chunk.toString());
        return callback(null, chunk);
    });

    ctx.onResponseData((ctx, chunk, callback) => {
        console.log("Res: " + chunk.toString());
        return callback(null, chunk);
    });
    return callback();
});

console.log('begin listening on 9003')
proxy.listen({ port: 9003 });