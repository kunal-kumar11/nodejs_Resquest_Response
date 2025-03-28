const express= require ('express')

const router=express.Router()


router.get('/',(req,res)=>{
    res.json({ message: "Here is the list of all orders." });
})

router.post('/',(req, res) => {
    res.json({ message: "A new order has been created." });
})


module.exports=router