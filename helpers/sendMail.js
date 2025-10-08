const transporter = require('../config/mailer');

const sendEmail = async (to, otp, name = 'Customer') => {
  await transporter.sendMail({
    from: `"VENICARA Fragrances" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your Exclusive VENICARA OTP – Authenticate Your Account",
    text: `Dear ${name},

Welcome to VENICARA — where luxury meets scent.

Your one-time password (OTP) is ${otp}. 
It is valid for 5 minutes. Please do not share this code with anyone.

With elegance,
The VENICARA Team`,
    html: `
      <div style="
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f7f6f3;
        color: #2b2b2b;
        padding: 40px;
        border-radius: 10px;
        border: 1px solid #eaeaea;
        max-width: 600px;
        margin: auto;
      ">
        <div style="text-align:center; margin-bottom: 25px;">
          <h1 style="
            font-size: 26px; 
            letter-spacing: 2px; 
            color: #1a1a1a; 
            font-weight: 600;
          ">
            VENICARA
          </h1>
          <p style="font-size: 12px; color: #888;">Luxury Fragrances & Essence</p>
        </div>

        <div style="
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        ">
          <p style="font-size: 16px;">Dear <b>${name}</b>,</p>
          <p style="font-size: 15px; line-height: 1.6;">
            Welcome to <b>VENICARA</b> — where every scent tells a story of elegance and individuality.
          </p>
          <p style="font-size: 15px; margin-top: 10px;">
            Your exclusive one-time password is:
          </p>

          <div style="
            background: #000;
            color: #fff;
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 3px;
            padding: 12px 0;
            margin: 20px 0;
            border-radius: 5px;
          ">
            ${otp}
          </div>

          <p style="font-size: 14px; color: #555;">
            This OTP is valid for <b>50 seconds</b>. Please do not share it with anyone.
          </p>

          <p style="font-size: 14px; color: #555; margin-top: 25px;">
            With elegance,<br/>
            <b>The VENICARA Team</b>
          </p>
        </div>

        <div style="text-align:center; margin-top: 30px; font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} VENICARA Fragrances<br/>
          Crafted with passion — redefining luxury.
        </div>
      </div>
    `,
  });
};

module.exports = sendEmail;
