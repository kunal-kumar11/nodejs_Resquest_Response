const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    console.log(`Request received: ${req.method} ${req.url}`); 
    console.log(req.url)
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <form action="/submit" method="POST">
                <label>Name</label>
                <input type="text" name="username">
                <button type="submit">Submit</button>
            </form>
        `);
    } else if (req.url === '/submit' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            console.log(`Received chunk: ${chunk}`); a
            body += chunk.toString();
        });

        req.on('end', () => {
            const usernameValue= body.split('=')
           
            fs.writeFileSync('data.txt', usernameValue[1]);
            console.log('Data written to file: data.txt'); 
            
            res.writeHead(302, { 'Location': '/' });
            res.end();
        });
    }
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
