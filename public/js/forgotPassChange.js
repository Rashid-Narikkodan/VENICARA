// public/js/userSignUp.js
const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
    e.preventDefault()
    let valid = true;

    const oldPass = document.getElementById("oldPass").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const confirm=document.getElementById('confirmPass').value.trim()

    // reset errors
    document.getElementById("oldPassError").textContent = "";
    document.getElementById("passError").textContent = "";
    document.getElementById("confirmError").textContent = "";

    if (oldPass.length < 6) {
      document.getElementById("oldPassError").textContent = "Password must be at least 6 chars";
      valid = false;
    }
    if (oldPass.length<=0) {
      document.getElementById("oldPassError").textContent = "Old password required";
      valid = false;
    }

    if (pass.length < 6) {
      document.getElementById("passError").textContent = "Password must be at least 6 chars";
      valid = false;
    }
    if (pass.length <= 0) {
      document.getElementById("passError").textContent = "New password is required";
      valid = false;
    }
    if (confirm.length < 6) {
      document.getElementById("confirmError").textContent = "Password must be at least 6 chars";
      valid = false;
    }
    if(pass!==confirm){
      document.getElementById("confirmError").textContent = "Confirm password is not matching";
      valid = false;
    }
    if (confirm.length <= 0) {
      document.getElementById("confirmError").textContent = "Confirm password is required";
      valid = false;
    }

    if (valid){
      form.submit()
    }
  });


