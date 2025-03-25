const http=require ('http')

const server=http.createServer((req,res)=>{
      
    let statusCode = 200;
    res.writeHead(statusCode, { 'Content-Type': 'text/html' });  
    let final_response="";
    if(req.url==='/'){
       final_response='<h1>Hello World</h1>'
    }else if(req.url === '/pizza'){
         final_response='<h1>This is your pizza</h1>'
    }else if(req.url === '/about'){
         final_response='<h1>Welcome to About Us</h1>'
    }else if(req.url === '/node'){
         final_response='<h1>Welcome to my Node Js project</h1>'
    }else{
        statusCode = 404;  
        final_response = '<h1>Page Not Found</h1>';
    }  
    
    res.end(final_response);
})

const PORT = 3000;


server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});