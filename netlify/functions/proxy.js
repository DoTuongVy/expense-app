const https = require('https');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzGKu-DwMfZ_KcXfK4EYkOlsFvh8r5lWf7btNP6hGwnigPYmvp3o8BxLBzMauQ8-hE/exec';

function fetchFollow(url, maxRedirects = 10) {
    return new Promise((resolve, reject) => {
        if (maxRedirects === 0) return reject(new Error('Too many redirects'));

        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
                const location = res.headers.location;
                res.resume();
                return resolve(fetchFollow(location, maxRedirects - 1));
            }
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve(body));
        }).on('error', reject);
    });
}

exports.handler = async (event) => {
    try {
        const params    = new URLSearchParams(event.queryStringParameters || {});
        const targetUrl = GAS_URL + '?' + params.toString();
        console.log('Target URL:', targetUrl);
        const data      = await fetchFollow(targetUrl);
        console.log('Response:', data.substring(0, 200));

        return {
            statusCode : 200,
            headers    : {
                'Content-Type'                : 'application/json',
                'Access-Control-Allow-Origin' : '*',
            },
            body: data,
        };
    } catch (err) {
        return {
            statusCode : 500,
            headers    : { 'Access-Control-Allow-Origin': '*' },
            body       : JSON.stringify({ thanhCong: false, thongBao: err.message }),
        };
    }
};