const express=require('express')

const router=express.Router()


router.post('/',(req,res)=>{
    res.send("Book has been added!")
})


module.exports=router