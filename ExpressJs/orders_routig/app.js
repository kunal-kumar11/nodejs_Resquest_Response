const express= require('express')

const app=express()

const ordersRoutes=require('./ordersRoutes')

const usersRoutes=require('./usersRoutes')

app.use((req,res,next)=>{
    
    console.log("Server has been created successfully")

    next()
})


// Routes
app.use('/orders', ordersRoutes);

app.use('/users', usersRoutes);


// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});