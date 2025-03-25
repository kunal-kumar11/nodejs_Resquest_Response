const http = require('http');
const fs = require('fs'); // Fixed missing fs import

const server = http.createServer((req, res) => {
    let url = req.url;

    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });

        let data = '';
        try {
            data = fs.readFileSync('data.txt', 'utf8'); // Changed fs.readFile to fs.readFileSync
        } catch (err) {
            console.error('Error reading file:', err);
        }

        res.end(` 
            <h1>${data}</h1>
            <form action="/submit" method="POST">
                <label>Name</label>
                <input type="text" name="username">
                <button type="submit">Submit</button>
            </form>`);
    } else if (req.url === '/submit' && req.method === 'POST') {
        let body = '';

        req.on('data', (chunk) => { // Fixed "chuck" to "chunk"
            body += chunk.toString();
        });

        req.on('end', () => { // Fixed req.end to req.on('end')
            const userValue = body.split('=');

            fs.writeFileSync('data.txt', userValue[1]); // Fixed "s.writeFileSync" to "fs.writeFileSync"
            console.log('Data written to file: data.txt');

            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
    }
});

server.listen(3008, () => {
    console.log('Server is running on port 3008');
});
