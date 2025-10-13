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


  const notyf = new Notyf({
    duration: 3000,           // Toast display duration
    position: { x: 'left', y: 'top' },
    dismissible: true,        // Users can close manually
    ripple: true              // Optional ripple animation
  });

  function showAlert(type, message) {
    notyf[type](message);
  }
