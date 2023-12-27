import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();


  var VerifyService = async({name,code,email})=>{

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.USER,
        pass: process.env.APP_PASSWORD
      }
    });
    console.log('Recipient Email:', email);

     const mailoptions = {
    from: process.env.USER,
    to: email,
    subject: 'Verification Request',
    html: `
    <p>Dear ${name},</p>
    <p>We have received your request to verify the credentials. If you really want to verify it kindly note the below code.</p>
    <h1>${code}<h1>
    <p>You can use the verification code to verify the credentials. Kindly login again with the code and verify yourself</p>`

     }

    await transporter.sendMail(mailoptions, function(error, info) {
    if (error) 
      console.log(error);
     else 
      console.log('Email sent: ' + info.response);
      console.log("Email sent Successfully")

  });

  }

  export default  {VerifyService}