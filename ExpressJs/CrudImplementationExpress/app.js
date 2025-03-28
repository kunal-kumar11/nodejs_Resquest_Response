const express=require('express')

const app=express()

const Courses=require('./routes/courses/courses')

const Student=require('./routes/student/student')

app.use((req,res,next)=>{
   next()
})



app.get('/',(req,res)=>{
    res.send('Welcome message')
})


app.use('/student',Student)

app.use('/courses',Courses)



app.all("*",(req,res)=>{
     res.statusCode(404).send('Page not found')
})

const port=4500

app.listen(port,()=>{
    console.log(`Server is active with port ${port}`)
})

