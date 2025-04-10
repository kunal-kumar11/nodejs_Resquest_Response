const express=require('express')
const db=require('./db')
const app=express()
const path=require('path')

require('dotenv').config();

app.use(express.json());

app.use((req,res,next)=>{
      next()
})

const port=process.env.PORT || 3000;

app.use(express.static('public'))

app.get('/',(req,res)=>{

    res.sendFile(path.join(__dirname,'public','index.html'))
})

app.post('/api/signupdetails',(req,res)=>{
  
    const {
        username,
        useremail,
        userpassword
    }= req.body

 const sql=`INSERT INTO user (username, email, password)
VALUES (?, ?, ?)
`
db.query(sql,[username,useremail,userpassword],(error,result)=>{
  if(error){
    if (error.code === 'ER_DUP_ENTRY') {
    
      return res.status(409).json({ error: 'Email already registered.' });
    }
    return res.status(500).json({ error: 'Something went wrong.' });
  }else{
    res.status(201).json({ message: 'User signed up successfully!', userId: result.insertId });
  }
})

})

app.listen(port,()=>{
    console.log(`server is active at port ${port}`)
})