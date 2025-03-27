const fs = require('fs');
let data = "undefine";

let routeHandle=(req, res) => {
        const url = req.url;
        const method = req.method;
    
        if (url === '/') {
            console.log("kizan");
            
            res.setHeader('Content-Type', 'text/html');
            res.end(`<h1>${data}</h
                1>
                <form action="/message" method="POST">
                    <label>Display Message</label>
                    <input type="text" name="username"></input>
                    <button type="submit">Button</button>
                </form>
            `);
        } else if (url === '/message' && method === 'POST') {
            let finalData = [];
    
            req.on('data', (chunk) => {
                console.log("Received Chunk:", chunk);
                finalData.push(chunk);
            });
    
            req.on("end", () => {
                let finalStr = Buffer.concat(finalData).toString().split('=')[1];
                console.log(finalStr);
    
                // Write to file and then read it after ensuring the write is complete
                fs.writeFile('data.txt', finalStr, (err) => {
                    if (err) {
                        console.log("Error writing file:", err);
                        res.statusCode = 500;
                        res.end("Internal Server Error");
                        return;
                    }
    
                    fs.readFile('data.txt', 'utf-8', (err, newData) => {
                        if (err) {
                            console.log("Error reading file:", err);
                            res.statusCode = 500;
                            res.end("Internal Server Error");
                            return;
                        }
    
                        data = newData;  
                        res.statusCode = 302;
                        res.setHeader('Location', '/');
                        res.end();
                    });
                });
            });
        }
    }



// routeHandle()


module.exports=routeHandle;