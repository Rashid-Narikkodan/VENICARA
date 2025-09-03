//signup otp  timer
const resend = document.getElementById('resend-otp');

resend.addEventListener('click', async (e) => {
  e.preventDefault();
  resend.innerHTML = 'Sending...';
  resend.style.pointerEvents = 'none';

  try {
    const response = await fetch('/auth/forgot/resend-otp', {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json(); // <-- await here

    console.log('hellooooo')
    if (data.success) {
      resend.innerHTML = 'Resend';
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

let timerId;

function startTimer(seconds) {
  if (timerId) clearInterval(timerId); // clear previous timer
  const timer = document.getElementById('timer');
  let i = seconds;

  timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`; // initial display

  timerId = setInterval(() => {
    i--;
    timer.innerHTML = `00:${i < 10 ? '0' + i : i}s`;
    if (i <= 0) {
      clearInterval(timerId);
      timer.innerHTML = `00:50s`
      resend.innerHTML = 'Resend';
      resend.style.pointerEvents = 'auto';
    }
  }, 1000);
}
