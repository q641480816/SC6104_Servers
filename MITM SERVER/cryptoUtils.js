import forge from 'node-forge';

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

let gcd = (a, b) => {
    return !b ? a : gcd(b, a % b);
}

let egcd = (a, m) => {
    // Extended Euclidian algorithm
    let oldR = a;
    let r = m;
    let oldS = 1n;
    let s = 0n;

    while (r > 0n) {
        let quot = oldR / r;

        let tempR = r;
        r = oldR - quot * r;
        oldR = tempR;

        let tempS = s;
        s = oldS - quot * s;
        oldS = tempS;
    }

    if (oldS < 0)
        oldS += m;
    return oldS;
};

let computPrivate = (e, p, q) => {
    let phi = (p - 1n) * (q - 1n);
    return egcd(e, phi);
}

let powerMod = (b, e, m) => {
    if (m === 1n) return 0n;
    let res = 1n;
    b = b % m;
    while (e > 0n) {
        if (e % 2n === 1n) 
            res = (res * b) % m;
        e = e >> 1n; 
        b = (b * b) % m;
    }
    return res;
}

let encrypt = (m, e, n) => {
    if (!isNaN(m)) {
        return powerMod(BigInt(m), e, n).toString();
    } else {
        return m.split('').map(c => powerMod(BigInt(c.charCodeAt(0)), e, n).toString());
    }
}

let decrypt = (c, d, n) => {
    if ((!Array.isArray(c))) {
        return powerMod(BigInt(c), d, n);
    } else {
        return c.map(i => String.fromCharCode(powerMod(BigInt(i), d, n).toString())).reduce((a, b) => a + b, "");
    }
}

export { getPrime, egcd, computPrivate, powerMod, encrypt, decrypt, gcd };
