export default async function handler(req, res) {
    const params = new URLSearchParams(req.query);
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxK3GTcWqA4jXbZE-Xs6xn2kcfcmmOGMQhSNjtDTgIwqItFVWpEkpPNbI6erCllH5ZkaA/exec';

    const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
        redirect: 'follow',
    });

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.json(data);
}