const nodemailer = require("nodemailer");
class Email {
  constructor(url, message, user) {
    this.url = url;
    this.message = message;
    this.from = `Nexus  <${process.env.EMAIL_USERNAME}>`;
    this.to = user.email;
this.firstname = user.name?.split(" ")[0] || "User";  }

  // createTransport() {
  //   return nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: process.env.EMAIL_USERNAME,
  //       pass: process.env.EMAIL_PASSWORD,
  //     },
  //   });
  // }
  createTransport() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
 async  send(subject){
    try{

        await this.createTransport().sendMail({
            from :this.from,
            to:this.to,
            subject:subject,
            text:this.message
        //      html: html,
        //    text: htmlToText.convert(html),

        });

        console.log("email sent to ", this.to)
    }catch(err){
        console.log(err);
    }
  }
}

module.exports = Email;
