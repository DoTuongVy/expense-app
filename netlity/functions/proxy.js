
    const https = require('https');
const url   = require('url');

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzGKu-DwMfZ_KcXfK4EYkOlsFvh8r5lWf7btNP6hGwnigPYmvp3o8BxLBzMauQ8-hE/exec';

exports.handler = async (event) => {
    const params = new URLSearchParams(event.queryStringParameters || {});
    const targetUrl = GAS_URL + '?' + params.toString();

    const data = await new Promise((resolve, reject) => {
        https.get(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let body = '';
            // ? Follow redirect thủ công
            if (res.statusCode === 302 || res.statusCode === 301) {
                const location = res.headers.location;
                https.get(location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
                    res2.on('data', chunk => body += chunk);
                    res2.on('end', () => resolve(body));
                }).on('error', reject);
            } else {
                res.on('data', chunk => body += chunk);
                res.on('end', () => resolve(body));
            }
        }).on('error', reject);
    });

    return {
        statusCode : 200,
        headers    : {
            'Content-Type'                : 'application/json',
            'Access-Control-Allow-Origin' : '*',
        },
        body: data,
    };
};