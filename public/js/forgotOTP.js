document.addEventListener('DOMContentLoaded', () => {
  const resend = document.getElementById('resend-otp');
  const timer = document.getElementById('timer');
  let timerId = null;
  let isTimerRunning = false;
  let isSending = false;

  // --- Timer Function ---
  function startTimer(seconds) {
    if (timerId) clearInterval(timerId); // prevent overlapping timers
    let remaining = seconds;
    isTimerRunning = true;

    // Disable resend while timer runs
    resend.style.pointerEvents = 'none';
    resend.innerHTML = 'Wait...';
    timer.textContent = `00:${remaining < 10 ? '0' + remaining : remaining}s`;

    timerId = setInterval(() => {
      remaining--;
      timer.textContent = `00:${remaining < 10 ? '0' + remaining : remaining}s`;

      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        isTimerRunning = false;
        timer.textContent = `00:00s`;
        resend.innerHTML = 'Resend';
        resend.style.pointerEvents = 'auto';
      }
    }, 1000);
  }

  // --- Handle Resend Click ---
  resend.addEventListener('click', async (e) => {
    e.preventDefault();

    if (isTimerRunning || isSending) return; // block if timer running or request pending

    isSending = true;
    resend.innerHTML = 'Sending...';
    resend.style.pointerEvents = 'none';

    try {
      const response = await fetch('/auth/forgot/resend-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await response.json();

      if (data.success) {
        startTimer(50); // restart 50s countdown
      } else {
        showAlert('error',data.message || "Something went wrong");
        resend.innerHTML = 'Resend';
        resend.style.pointerEvents = 'auto';
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      resend.innerHTML = 'Resend';
      resend.style.pointerEvents = 'auto';
    } finally {
      isSending = false; // request finished
    }
  });

  // --- Auto start timer when page loads ---
  startTimer(50);
});
