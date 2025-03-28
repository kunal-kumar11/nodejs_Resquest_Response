const express=require('express')

const app=express()


app.use((req,res,next)=>{
   
    res.send('<h1>Server is up and running on port 3000! Ready to handle requests.</h1>')

})

const port=3000
app.listen(port,()=>{
    console.log("Server is active")
})