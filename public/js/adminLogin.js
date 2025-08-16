const eye=document.getElementById('eye')
const passInput=document.getElementById('password')
eye.addEventListener('click',(e)=>{
  if(passInput.type === 'password'){
    eye.classList.replace('fa-eye-slash','fa-eye')
    passInput.type = 'text'
  }else{
    eye.classList.replace('fa-eye','fa-eye-slash')
    passInput.type = 'password'
  }
})