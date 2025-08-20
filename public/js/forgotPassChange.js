// public/js/userSignUp.js
const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
    e.preventDefault()
    let valid = true;
    const pass = document.getElementById("pass").value.trim();
    const confirm=document.getElementById('confirmPass').value.trim()

    // reset errors
    document.getElementById("passError").textContent = "";

    if (pass.length < 6) {
      document.getElementById("passError").textContent = "Password must be at least 6 chars";
      valid = false;
    }
    if(pass!==confirm){
      document.getElementById("confirmError").textContent = "Confirm password is not matching";
      valid = false;

    }

    if (valid){
      form.submit()
    }
  });


