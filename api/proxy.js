export default async function handler(req, res) {
    try {
        const params = new URLSearchParams(req.query);
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxK3GTcWqA4jXbZE-Xs6xn2kcfcmmOGMQhSNjtDTgIwqItFVWpEkpPNbI6erCllH5ZkaA/exec';

        const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'Accept': 'application/json',
            }
        });

        const text = await response.text();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(text);

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}