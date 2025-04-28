import nodemailer from 'nodemailer';
import { buffer } from 'stream/consumers';
class MailServices {


    sendMailToUser = async (buffer:any) => {

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'suriyasivakumar60@gmail.com',
                pass: 'ehno snrm dipn mamw'
            }
        });

        const mailOptions = {
            from: '"Surya from Event Manager" <suriyasivakumar60@gmail.com>',
            to: "suriyasivakumar80@gmail.com",
            subject: "🎟️ Your Event Ticket Confirmation",
            text: "Thanks for booking. Ticket ID: 10000",
            html: `
              <h2>Thanks for booking your event!</h2>
              <p>Your ticket ID is <strong>10000</strong></p>
              <p>We look forward to seeing you there!</p>
              <br/>
              <p>Cheers,<br/>Surya<br/>Event Manager Team</p>
              <small>This email was sent by Surya via Gmail SMTP</small>
            `,
            attachments:[
                {
                    filename:"ticket.pdf",
                    content:buffer,
                    contentType:"application/pdf"
                }
            ]
          };
       
            const data = await transporter.sendMail(mailOptions);
            console.log("Mail sended : " + data.response)
        
       

    };
}

export default MailServices;