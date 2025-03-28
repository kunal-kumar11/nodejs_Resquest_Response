const express=require('express')

const router=express.Router()


router.get('/',(req,res)=>{
    res.send("Here is the list of books!")
})


module.exports=router