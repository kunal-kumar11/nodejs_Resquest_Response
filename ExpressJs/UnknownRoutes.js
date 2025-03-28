const express= require('express')

const app=express()


app.use((req,res,next)=>{
      next()
})

app.get('/products',(req,res)=>{
   res.send("Here is the list of all products.")
})

app.post('/products',(req,res)=>{
    res.send("A new product has been added.")
})
app.get('/categories',(req,res)=>{
    res.send("Here is the list of all categories.")
})
app.post('/categories',(req,res)=>{
    res.send("A new category has been created.")
})


app.all("*",(req,res)=>{
   res.status(404).json({error:"Route not found"})
})

let port=4000;

app.listen(port,(req,res)=>{
  console.log("Server is active at port 4000")
})
