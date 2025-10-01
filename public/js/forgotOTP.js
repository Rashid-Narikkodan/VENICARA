const resend = document.getElementById('resend-otp');
let timerId;
let isTimerRunning = false;
let isSending = false;

resend.addEventListener('click', async (e) => {
  e.preventDefault();

  // Block clicks if sending or timer is running
  if (isTimerRunning || isSending) return;

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
  } finally {
    isSending = false; // request finished
  }
});

function startTimer(seconds) {
  const timer = document.getElementById('timer');
  let i = seconds;
  isTimerRunning = true;

  // initial display
  timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`;
  resend.style.pointerEvents = 'none'; // prevent clicking while timer runs

  timerId = setInterval(() => {
    i--;
    timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`;

    if (i <= 0) {
      clearInterval(timerId);
      timerId = null;
      isTimerRunning = false;
      timer.innerHTML = `00:${seconds < 10 ? '0' + seconds : seconds}s`;
      resend.innerHTML = 'Resend';
      resend.style.pointerEvents = 'auto'; // enable button again
    }
  }, 1000);
}
