import QRCode from 'qrcode';
import puppeteer from 'puppeteer';
class TicketServices{


    private generateQrCodeBase64=async(text:any)=>{
        return await QRCode.toDataURL(text);
    }

    generateTicketPdf=async()=>{

        const qrCodeUrl = await this.generateQrCodeBase64("suriya");

const browser = await puppeteer.launch();

const page = await browser.newPage();

const html = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 30px; }
          .ticket {
            border: 2px dashed #444;
            padding: 20px;
            width: 500px;
            margin: auto;
            text-align: center;
          }
          .qr {
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>🎟️ Event Ticket</h1>
         

          <div class="qr">
            <img src="${qrCodeUrl}" width="150" height="150" />
          </div>

          <p>Scan this QR at the entrance</p>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);

  const pdf = await page.pdf({format:'A5',printBackground:true})
browser.close();
return pdf;
        

    }
}
export default TicketServices;