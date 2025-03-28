const express = require('express')

const route=express.Router()


route.get('/',(req,res)=>{
    res.send("Fetching all users")
})


route.post('/',(req,res)=>{
    res.send("Adding a new user")
})


route.get('/:id',(req,res)=>{
    const id=parseInt(req.params.id)
    res.send(`Fetching user with ID: ${id}`)
})

module.exports=route