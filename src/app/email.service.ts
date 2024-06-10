// email.service.ts

import { Injectable } from '@angular/core';
import * as nodemailer from 'nodemailer';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() { }

  sendEmail(formData: any) {
    const transporter = nodemailer.createTransport({
      host: 'mail.onemakan.ma',
      port: 465,
      secure: true,
      auth: {
        user: 'support@onemakan.ma',
        pass: 'e[QC8Zr;4#pg'
      }
    });

    const mailOptions = {
      from: formData.email,
      to: 'support@onemakan.ma',
      subject: formData.subject,
      text: formData.message
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
