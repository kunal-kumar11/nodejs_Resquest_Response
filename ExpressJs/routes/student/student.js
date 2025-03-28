const express=require('express')

const router=express.Router()

const students = [

    { id: 1, name: "Alice" },
    
    { id: 2, name: "Bob" },
    
    { id: 3, name: "Charlie" }
    
    ];


router.get('/',(req,res)=>{
    
    res.json(students)
    
})

router.get('/:id',(req,res)=>{
  
    const id=parseInt(req.params.id)

    const student=students.find(s=> s.id===id)

    if(student){
        res.json(student)
    }else{
        res.status(404).json({ message: "Student not found" }); 
    }
    
})


module.exports=router