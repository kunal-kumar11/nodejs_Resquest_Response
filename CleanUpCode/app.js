const http = require('http');

const route=require('./route')
console.log(route)
const server = http.createServer(route);
//console.log(route)
server.listen(3008, () => {
    console.log("Server Is Now Active");
});
