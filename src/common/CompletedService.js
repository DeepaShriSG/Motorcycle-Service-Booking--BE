import nodemailer from 'nodemailer'
import dotenv from "dotenv";
dotenv.config();


  var Service = async({name,email})=>{

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
    subject: 'Service-Completed',
    html: `
    <p>Dear ${name},</p>
    <p>We had completed your service request. If you have any feedback on the service.kindly contact for Service Team.</p>
    
    <p>Contact the Service Team for further assistance <b> 8632261755 </b> </p>
    <p><b>Jessie Lubowitz</b> will assist you</p>`
    
     }

    await transporter.sendMail(mailoptions, function(error, info) {
    if (error) 
      console.log(error);
     else 
      console.log('Email sent: ' + info.response);
      console.log("Email sent Successfully")

  });

  }

  export default  {Service}