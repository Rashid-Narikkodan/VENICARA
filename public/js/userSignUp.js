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

    if (!name) {
      document.getElementById("nameError").textContent = "Name is required";
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

//signup otp  timer
const resend = document.getElementById('resend-otp');

resend.addEventListener('click', async (e) => {
  console.log('helloo')
  e.preventDefault();
  resend.innerHTML = 'Sending...';
  resend.style.pointerEvents = 'none';

  try {
    const response = await fetch('/signup/resend-otp', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resend: true })
    });

    const data = await response.json(); // <-- await here

    if (data.success) {
      startTimer(50); // start countdown from 50 seconds
    } else {
      alert(data.message || "Something went wrong");
      resend.innerHTML = 'Resend';
      resend.style.pointerEvents = 'auto';
    }
  } catch (err) {
    console.error(err);
    resend.innerHTML = 'Resend';
    resend.style.pointerEvents = 'auto';
  }
});

function startTimer(seconds) {
  const timer = document.getElementById('timer');
  let i = seconds;

  timer.innerHTML = `00:${i < 10 ? '0' + i : i}`; // initial display

  const id = setInterval(() => {
    i--;
    timer.innerHTML = `00:${i < 10 ? '0' + i : i}`;

    if (i <= 0) {
      clearInterval(id);
      resend.innerHTML = 'Resend';
      resend.style.pointerEvents = 'auto';
    }
  }, 1000);
}
