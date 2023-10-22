let forge = require('node-forge');

let getPrime = bits => {
    return new Promise((resolve, rejects) => {
        forge.prime.generateProbablePrime(bits, (err, res) => {
            if (err) {
                rejects(err);
                return;
            }
            resolve(BigInt(res.toString(10)));
        });
    });
}

let modMultInverse = function (a, m) {
    // Extended Euclidian algorithm
    var oldR = a;
    var r = m;
    var oldS = 1n;
    var s = 0n;

    while (r > 0n) {
        var quot = oldR / r;

        var tempR = r;
        r = oldR - quot * r;
        oldR = tempR;

        var tempS = s;
        s = oldS - quot * s;
        oldS = tempS;
    }

    if (oldS < 0)
        oldS += m;
    return oldS;
};

let computPrivate = (e, p, q) => {
    let phi = (p - 1n) * (q - 1n);
    return modMultInverse(e, phi);
}

let powerMod = (b, e, m) => {
    if (m === 1n) return 0n;
    var res = 1n;
    b = b % m;
    while (e > 0n) {
        if (e % 2n === 1n)  //odd number
            res = (res * b) % m;
        e = e >> 1n; //divide by 2
        b = (b * b) % m;
    }
    return res;
}

let encrypt = (m, e, n) => {
    return powerMod(m, e, n);
}

let decrypt = (c, d, n) => {
    return powerMod(c, d, n);
}

module.exports = {
    getPrime: getPrime,
    modMultInverse: modMultInverse,
    computPrivate: computPrivate,
    powerMod: powerMod,
    encrypt: encrypt,
    decrypt: decrypt
};
