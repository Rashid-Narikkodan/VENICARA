setTimeout(() => {
  const successBox = document.getElementById('successBox');
  const errorBox = document.getElementById('errorBox');

  if (successBox) {
    successBox.classList.add('fadeOut')
    successBox.addEventListener('transitionend',()=>{
      successBox.remove();
    })
  }

  if (errorBox){
    errorBox.classList.add('fadeOut')
    errorBox.addEventListener('transitionend',()=>{
      errorBox.remove();
    })
  }
}, 3000);
