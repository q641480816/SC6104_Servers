import express from 'express';
import * as cUtil from './cryptoUtils.js';
import http from 'http';

const app = express();

let p1;
let p2;
let p3;
let n1;
let n2;
let e = BigInt(0X1001);
let eCP = BigInt(0x101);
let RSA_SET;
let RSA;
let RSA_SPOTIFY;
let RSA_PIKPAK;

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
        }];

        RSA_SPOTIFY = {
            public: { e: e.toString(), n: n1.toString() },
            p: p1,
            q: p2,
            n: n1,
            e: e,
            d: d1
        }

        RSA_PIKPAK = {
            public: { e: eCP.toString(), n: n1.toString() },
            p: p1,
            q: p2,
            n: n1,
            e: eCP,
            d: cUtil.computPrivate(eCP, p1, p2)
        }

        app.use(express.json());
        app.get('/useRSAone', (req, res) => {
            RSA = RSA_SET[0];
            res.send(RSA_SET[0].public);
        });

        app.get('/useRSAtwo', (req, res) => {
            RSA = RSA_SET[1];
            res.send(RSA_SET[1].public);
        });

        app.get('/helloServer', (req, res) => {
            res.send(RSA.public);
        });

        app.post('/chat', (req, res) => {
            let m = cUtil.decrypt(req.body.msg, RSA.d, RSA.n);
            console.log("Reveived Chat message: " + req.body.msg + ", decrypted message: " + m);
            res.send({ msg: "Ok" });
        });

        const server = http.Server(app);

        server.listen(9000, () => {
            console.log(`[-] Server Listening on Port 9000`);
        });
    })
    .catch(err => console.log(err));




