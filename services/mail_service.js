
const nodemailer = require('nodemailer');


const EmailStarter = class EmailServer {
    constructor(service,authData){
        this.service = service ?? 'gamil',
        this.auth.user =  authData.user ?? "stephen.ignatius@korsgy.com",
        this.auth.pass = authData.password ?? "tczkonuzmpehzbeg"
    }


    initTransport(){
        nodemailer.createTransport({
            service : this.service,
            auth : this.auth
    }) }

}

const EmailService = (from,email,subject,html)=>{

    const transporter = nodemailer.createTransport({
        service : 'gmail',
        auth : {
            user : "stephen.ignatius@korsgy.com",
            pass : "tczkonuzmpehzbeg"
        }
        })


        transporter.sendMail({
            from: '"THURVPN" <youremail@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'OTP REQUEST', // Subject line
            html: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 10px 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #d62333;">Your OTP is ${otp}</h2>
                    <p style="color: #333;">Use this OTP to verify your account within the next 5 minutes. Do not share this OTP with anyone. If it exceeds 5 minutes, request for a new OTP.</p>
                    </div>`, // html body
            });

}


