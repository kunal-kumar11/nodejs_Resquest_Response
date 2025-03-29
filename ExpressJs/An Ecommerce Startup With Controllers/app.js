const express = require('express')

const app=express()

const carts=require('./routes/carts')

const products=require('./routes/products')

const users=require('./routes/user')

app.use((req,res,next)=>{
   next()
})

app.use('/users',users)

app.use('/products',products)

app.use('/cart',carts)

app.all("*",(req,res)=>{

    res.status(404).json({message:"***Page not Found***"})

})

const port=4400;


app.listen(port,(req,res)=>{
  console.log(`Server is active now ${port}`)
})

