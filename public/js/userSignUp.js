// public/js/userSignUp.js
const form = document.getElementById("form");

form.addEventListener("submit", (e) => {
    e.preventDefault()
    let valid = true;

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("pass").value.trim();
    const confirm = document.getElementById("confirmPass").value.trim();

    // reset errors
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passError").textContent = "";
    document.getElementById("confirmError").textContent = "";

    const namePattern = /^[A-Za-z]+(?: [A-Za-z]+)*$/; // only letters + single spaces

    if (!name) {
      document.getElementById("nameError").textContent = "Name is required";
      valid = false;
    } else if (name.length < 2) {
      document.getElementById("nameError").textContent = "Name must be at least 2 characters long";
      valid = false;
    } else if (name.length > 50) {
      document.getElementById("nameError").textContent = "Name cannot exceed 50 characters";
      valid = false;
    } else if (!namePattern.test(name)) {
      document.getElementById("nameError").textContent = "Name can only contain letters and single spaces";
      valid = false;
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      document.getElementById("emailError").textContent = "Invalid email";
      valid = false;
    }

    if (pass.length < 6) {
      document.getElementById("passError").textContent = "Password must be at least 6 chars";
      valid = false;
    }

    if (pass !== confirm) {
      document.getElementById("confirmError").textContent = "Passwords do not match";
      valid = false;
    }
    if (valid){
      form.submit()
    }
  });


