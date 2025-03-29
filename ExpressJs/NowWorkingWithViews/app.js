const express=require("express")
const path=require('path')
const app=express()



app.get('/',(req,res)=>{

    res.sendFile(path.join(__dirname,"views","index.html"))
})

const port=4800
app.listen(port,()=>{
    console.log(`Server is active at ${port}`)
})


