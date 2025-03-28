const express = require('express')

const route=express.Router()


route.get('/:userId',(req,res)=>{
    const id=parseInt(req.params.userId)
    res.send(`Fetching cart for user with ID: ${id}`)
})


route.post('/:userId',(req,res)=>{
    const id=parseInt(req.params.userId)
    res.send(`Adding product to cart for user with ID: ${id}`)
})

module.exports=route