
const nodemailer = require('nodemailer');


 module.exports =  class EmailServer {

    constructor(){
        this.service = 'gmail',
        this.user =  "thurvpn@gmail.com",
        this.pass =  "cyosonkokxnuozvh"
    }


    initTransport(){
       return nodemailer.createTransport({
            service : this.service,
            auth : {
                user: this.user,
                pass:this.pass
            }
    }) }

    async sendMailTo(from = null, to = null, subject,html){
        if(to == null)return
        
        const resp = await this.initTransport().sendMail({
            from: from , // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html 
            });
            return resp;
    }

}

