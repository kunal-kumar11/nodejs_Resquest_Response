const express=require('express')

const app=express()

const path=require('path')

app.use(express.json());
app.use(express.static('public'))

app.use((req,res,next)=>[
    next()
])


app.get('/api/product',(req,res)=>{
  res.sendFile(path.join(__dirname,'views','index.html'))
})

 app.post('/api/product',(req,res)=>{

   res.send("DATA AA GAYA HAI")
  
 })

const port=4500

app.listen(port,()=>{
  console.log(`Server is active at ${port}`)   
})