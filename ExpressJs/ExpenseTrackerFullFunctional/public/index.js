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
    axios.post('http',obj).then((result)=>{
          console.log(`data from res send ${result}`)
    }).catch((error)=>{
          console.log(error)
    })

}