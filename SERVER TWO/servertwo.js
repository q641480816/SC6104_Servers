import express from 'express';
const app = express();
import * as cUtil from './cryptoUtils.js';
import fetch from 'node-fetch';
import http from 'http';
import { HttpProxyAgent } from 'http-proxy-agent';

const agent = new HttpProxyAgent('http://localhost:9003');
const messages = ["Teh C", "Teh O Bing", "Teh Bing Kasong", "Copi O Kasong Bing"];
// const messages = ["1", "2", "33", "4"];

let serverRSAPbK;

let chat = (c) => {
    fetch('http://localhost:9000/chat', {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ msg: c }),
        agent: agent
    }).then(res => res.json())
        .then(res => console.log("Reveived Response: " + res.msg));
}

app.use(express.json());
app.get('/startChat', (req, resp) => {
    fetch('http://localhost:9000/helloServer', { agent: agent })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            serverRSAPbK = res;
            messages.forEach(message => {
                chat(cUtil.encrypt(message, BigInt(serverRSAPbK.e), BigInt(serverRSAPbK.n)));
            })
            resp.send('Started')
        })
});

app.post('/chatWithMsg', (req, res) => {
    let msg = req.body.msg;
    chat(cUtil.encrypt(msg, BigInt(serverRSAPbK.e), BigInt(serverRSAPbK.n)));
    res.send(msg);
});

const server = http.Server(app);

server.listen(9001, () => {
    console.log(`[-] Server Listening on Port 9001`);
});




