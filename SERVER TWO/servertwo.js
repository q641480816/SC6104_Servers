import express from 'express';
const app = express();
import * as cUtil from './cryptoUtils.js';
import fetch from 'node-fetch';
import http from 'http';

let options = {
    host: "proxy",
    port: 9003,
    path: "http://localhost",
    headers: {
        Host: "localhost"
    }
}
const message = 123;

let serverRSAPbK;

let chat = (c) => {
    fetch('http://localhost:9000/chat', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ msg: c.toString() })
    }).then(res => res.json())
        .then(res => console.log("Reveived Response: " + res.msg));
}

app.get('/startChat', function (req, resp) {
    fetch('http://localhost:9000/helloServer')
        .then(res => res.json())
        .then(res => {
            console.log(res);
            serverRSAPbK = res;
            let c = cUtil.encrypt(BigInt(message), BigInt(serverRSAPbK.e), BigInt(serverRSAPbK.n));
            chat(c);
            resp.send('Started')
        })
});

// app.get('/useRSAtwo', function (req, res) {
//     res.send();
// });

const server = http.Server(options, app);

server.listen(9001, () => {
    console.log(`[-] Server Listening on Port 9001`);
});




