// const express=require('express')

// const app=express()


// app.use((req,res,next)=>{
   
//     res.send('<h1>Server is up and running on port 3000! Ready to handle requests.</h1>')

// })

// const port=3000
// app.listen(port,()=>{
//     console.log("Server is active")
// })


//creating different middleware 

const express=require('express')


const app=express()

//basis library
app.use((req,res,next)=>{
  console.log("This is library ")
  next();
})

//library one

app.use("library_one",(req,res,next)=>{
    console.log("This is library one")
    next();
  })

//library two
app.use("library_two",(req,res,next)=>{
    console.log("This is library one")
    next();
  })

  
//route handler
app.get('/',(req,res)=>{
         res.send("<h1>Welcome to get request library_one</h1>")
})


app.get('/library_one',(req,res)=>{
    res.send("<h1>Welcome to get request </h1>")
})

app.get('/library_two',(req,res)=>{
    res.send("<h1>Welcome to get request library_two</h1>")
})

app.listen(3200,()=>{
    console.log("Server is active at port 3200")
})


