const express=require('express')

const router=express.Router()



const courses = [

    { id: 1, name: "Frontend", description: "HTML, CSS, JS, React" },
    
    { id: 2, name: "Backend", description: "Node.js, Express, MongoDB" }
    
];


router.get('/',(req,res)=>{
    res.json(courses)
})


router.get('/:id',(req,res)=>{
  
    const id=parseInt(req.params.id)

    const course=courses.find(c=> c.id===id)

    if(course){
        res.json(course)
    }else{
        res.status(404).json({ message: "Student not found" }); 
    }
    
})

module.exports=router