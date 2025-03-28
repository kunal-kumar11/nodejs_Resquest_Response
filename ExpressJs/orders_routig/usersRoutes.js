const express= require ('express')

const router=express.Router()


router.get('/',(req,res)=>{
    res.json({ message: "Here is the list of all users." });
})

router.post('/',(req, res) => {
    res.json({ message: "A new user has been added." });
})


module.exports=router