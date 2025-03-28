const express=require('express')

const app=express()

const getBook=require('./routes/getBooks')
const postBook=require('./routes/postBook')

app.use((req,res,next)=>{
    next()
})


app.use('/books',getBook)
app.use('/books',postBook)


const port=3200

app.listen(port,()=>{
    console.log("Server is active now!!!")
})