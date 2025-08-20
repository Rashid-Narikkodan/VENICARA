const form = document.getElementById("form");
form.addEventListener("submit", (e) => {
    e.preventDefault()
    let valid = true;
    const email = document.getElementById("email").value.trim();
    // reset errors
    document.getElementById("emailError").textContent = "";

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      document.getElementById("emailError").textContent = "Invalid email";
      valid = false;
    }
    if (valid){
      form.submit()
    }
  });


