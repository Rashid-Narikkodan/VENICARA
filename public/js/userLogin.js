// public/js/userSignUp.js
const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
    e.preventDefault()
    let valid = true;
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();

    // reset errors
    document.getElementById("emailError").textContent = "";
    document.getElementById("passError").textContent = "";

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      document.getElementById("emailError").textContent = "Invalid email";
      valid = false;
    }

    if (pass.length < 6) {
      document.getElementById("passError").textContent = "Password must be at least 6 chars";
      valid = false;
    }

    if (valid){
      form.submit()
    }
  });


