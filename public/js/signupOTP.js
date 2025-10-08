document.addEventListener('DOMContentLoaded', () => {
  const resend = document.getElementById('resend-otp');
  const timer = document.getElementById('timer');
  const successOTP = document.getElementById('success-otp');
  let timerId;

  // --- Timer Function ---
  function startTimer(seconds) {
    if (timerId) clearInterval(timerId);
    let i = seconds;

    // Disable resend while countdown runs
    resend.style.pointerEvents = 'none';
    resend.innerHTML = 'Wait...';
    timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`;

    timerId = setInterval(() => {
      i--;
      timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`;

      if (i <= 0) {
        clearInterval(timerId);
        timer.innerHTML = `00:00s`;
        resend.innerHTML = 'Resend';
        resend.style.pointerEvents = 'auto';
      }
    }, 1000);
  }

  // --- Handle Resend Click ---
  resend.addEventListener('click', async (e) => {
    e.preventDefault();
    resend.innerHTML = 'Sending...';
    resend.style.pointerEvents = 'none';

    try {
      const response = await fetch('/auth/signup/resend-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resend: true })
      });

      const data = await response.json();

      if (data.success) {
        resend.innerHTML = 'Resend';
        startTimer(50); // restart 50s timer
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

  // --- Fade out success message ---
  if (successOTP && successOTP.textContent.trim() !== '') {
    setTimeout(() => {
      successOTP.classList.add('fade-out');
      successOTP.addEventListener('transitionend', () => {
        successOTP.remove();
      });
    }, 3000);
  }

  // --- Auto start timer when page loads ---
  console.log('Page loaded → Starting OTP timer');
  startTimer(50);
})