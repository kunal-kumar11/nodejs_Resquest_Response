const express= require('express')

const app=express()


app.use((req,res,next)=>{
    
    req.user="Guest"

    next()
})


app.get('/welcome',(req,res)=>{

    res.send(`<h1>Welcome,${req.user} </h1>`)

})

app.listen(3400,()=>{
    console.log("Server it active at port 3400")
})
