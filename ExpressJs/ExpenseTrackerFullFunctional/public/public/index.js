function solve(event){
    event.preventDefault()
    const username=event.target.username.value;
    const useremail=event.target.useremail.value;
    const userpassword=event.target.userpassword.value;
    
    const obj={
        username,
        useremail,
        userpassword
    }
    axios.post('http://localhost:3111/api/signupdetails',obj).then((result)=>{
          console.log(`data from res send`)
          console.log(result)
    }).catch((error)=>{
        console.log(error)
        if(error.response.data.error=='Email already registered.'){
            alert('This email already exists')
        }
    })

}