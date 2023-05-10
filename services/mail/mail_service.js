const nodemailer = require("nodemailer");

module.exports = class EmailServer {
  constructor() {
    // (this.service = "gmail"), (this.from = '"THURVPN" <noreply@thurvpn.com>');
    // (this.user = "noreply@thurvpn.com"), 
    // (this.pass = "kdmnmqaommgpsasf");
    // (this.pass = "kdmnmqaommgpsasf");
    (this.service = "gmail"),(this.from = '"THURVPN" <support@thurvpn.com>');
    this.pass =  "bEd3Wq4Y3iAhLJ5" //noreply pass
    // this.user =  "thurvpn@gmail.com",
    this.pass =  "cyosonkokxnuozvh"
    // kecewkxqebrusbkq
    // this.from = '"THURVPN" <support@thurvpn.com>'
    // this.host = 'thurvpn.com',
    // this.port = 465;
    this.user =  "support@thurvpn.com",
    this.pass =  "ThurVPN!!2023"
    // this.from = '"THURVPN" <support@thurvpn.com>'
  }
  
  initTransport() {
    return nodemailer.createTransport({
      service: this.service,
      host: "smpt.gmail.com",
      port: 465,
      secure: true,
      ssl:true,
      auth: {
        user: this.user,
        pass: this.pass
      }
    },(err,succ)=>{
      if(err)console.log(err)

      console.log(succ)
    });
  }

  async sendMailTo(from = null, to = null, subject, html) {
    if (to == null) return;

    const resp = await this.initTransport().sendMail(
      {
        from: from ?? this.from, // sender address
        to: to, // list of receivers

        subject: subject, // Subject line
        html: html
      },
      function (err, res) {
        if (err) console.log(err);
      }
    );
    return resp;
  }
};
