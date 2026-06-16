import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.zoho.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

const FROM_EMAIL = process.env.SMTP_USER ?? "info@tuistech.co.ke";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "info@tuistech.co.ke";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Forge & Timber Atelier" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  paymentMethod: string;
  bookingId: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const { clientName, clientEmail, service, date, paymentMethod, bookingId } = data;
  await sendEmail(clientEmail, "Booking Confirmed – Forge & Timber Atelier",
    bookingClientHtml({ clientName, service, date, paymentMethod, bookingId }));
  await sendEmail(ADMIN_EMAIL, `New Booking – ${clientName} (${service})`,
    bookingAdminHtml({ clientName, clientEmail, service, date, paymentMethod, bookingId }));
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  clientName: string;
  clientEmail: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  mpesaReceiptNumber?: string | null;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { clientName, clientEmail, orderId, items, totalAmount, paymentMethod, mpesaReceiptNumber } = data;
  await sendEmail(clientEmail, "Order Confirmed – Forge & Timber Atelier",
    orderClientHtml({ clientName, orderId, items, totalAmount, paymentMethod, mpesaReceiptNumber }));
  await sendEmail(ADMIN_EMAIL, `New Shop Order – ${clientName} (KSh ${totalAmount.toLocaleString()})`,
    orderAdminHtml({ clientName, clientEmail, orderId, items, totalAmount, paymentMethod, mpesaReceiptNumber }));
}

const baseStyle = `background:#131313;font-family:Georgia,serif;margin:0;padding:0;`;
const headerHtml = (subtitle: string) => `
  <tr>
    <td style="background:#0e0e0e;border-top:3px solid #e8bf9b;padding:36px 40px;text-align:center;">
      <h1 style="margin:0;color:#e8bf9b;font-size:26px;">Forge &amp; Timber</h1>
      <p style="margin:6px 0 0;color:#9c8e84;font-size:11px;font-family:monospace;">ATELIER &middot; NAIROBI</p>
      <p style="margin:12px 0 0;color:#ffb785;font-size:11px;font-family:monospace;">${subtitle}</p>
    </td>
  </tr>`;

const footerHtml = `
  <tr>
    <td style="background:#0e0e0e;padding:24px 40px;border-top:1px solid rgba(79,69,61,0.3);">
      <p style="color:#9c8e84;font-size:12px;margin:0 0 4px;">Forge &amp; Timber Atelier &middot; Nairobi, Kenya</p>
      <p style="color:#4f453d;font-size:11px;margin:0;">+254 726 461 196 &middot; info@tuistech.co.ke</p>
    </td>
  </tr>`;

const ctaButton = (href: string, label: string) => `
  <table cellpadding="0" cellspacing="0" style="margin-top:24px;">
    <tr><td style="background:#e8bf9b;">
      <a href="${href}" style="display:block;padding:14px 28px;color:#442b12;font-size:12px;font-weight:bold;text-decoration:none;font-family:monospace;">${label}</a>
    </td></tr>
  </table>`;

const detailRow = (label: string, value: string) => `
  <tr>
    <td style="padding:11px 20px;border-bottom:1px solid rgba(79,69,61,0.15);width:40%;">
      <p style="margin:0;color:#9c8e84;font-size:10px;font-family:monospace;">${label}</p>
    </td>
    <td style="padding:11px 20px;border-bottom:1px solid rgba(79,69,61,0.15);">
      <p style="margin:0;color:#e5e2e1;font-size:13px;">${value}</p>
    </td>
  </tr>`;

const wrap = (body: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="${baseStyle}">
  <table width="100%" cellpadding="0" cellspacing="0" style="${baseStyle}padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        ${body}
        ${footerHtml}
      </table>
    </td></tr>
  </table>
</body></html>`;

function bookingClientHtml(d: { clientName: string; service: string; date: string; paymentMethod: string; bookingId: string }) {
  return wrap(`
    ${headerHtml("BOOKING CONFIRMED")}
    <tr><td style="background:#1c1b1b;padding:36px 40px;">
      <h2 style="color:#e5e2e1;font-size:22px;margin:0 0 16px;">Karibu, ${d.clientName}. Your consultation is secured.</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:24px;">
        ${detailRow("BOOKING ID", d.bookingId)}
        ${detailRow("SERVICE", d.service)}
        ${detailRow("DATE", d.date)}
        ${detailRow("PAYMENT", d.paymentMethod)}
      </table>
      ${ctaButton(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://forgetimber.tuistech.co.ke"}/dashboard`, "VIEW MY DASHBOARD &rarr;")}
    </td></tr>`);
}

function bookingAdminHtml(d: { clientName: string; clientEmail: string; service: string; date: string; paymentMethod: string; bookingId: string }) {
  return wrap(`
    ${headerHtml("NEW BOOKING RECEIVED")}
    <tr><td style="background:#1c1b1b;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:20px;">
        ${detailRow("BOOKING ID", d.bookingId)}
        ${detailRow("CLIENT", d.clientName)}
        ${detailRow("EMAIL", d.clientEmail)}
        ${detailRow("SERVICE", d.service)}
        ${detailRow("DATE", d.date)}
        ${detailRow("PAYMENT", d.paymentMethod)}
      </table>
      ${ctaButton(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://forgetimber.tuistech.co.ke"}/admin`, "OPEN ADMIN PANEL &rarr;")}
    </td></tr>`);
}

function orderClientHtml(d: { clientName: string; orderId: string; items: OrderItem[]; totalAmount: number; paymentMethod: string; mpesaReceiptNumber?: string | null }) {
  const itemRows = d.items.map(i => `
    <tr>
      <td style="padding:10px 20px;border-bottom:1px solid rgba(79,69,61,0.15);color:#e5e2e1;">${i.name}</td>
      <td style="padding:10px 20px;border-bottom:1px solid rgba(79,69,61,0.15);color:#9c8e84;text-align:center;">${i.quantity}</td>
      <td style="padding:10px 20px;border-bottom:1px solid rgba(79,69,61,0.15);color:#e8bf9b;text-align:right;">KSh ${(i.price * i.quantity).toLocaleString()}</td>
    </tr>`).join("");
  return wrap(`
    ${headerHtml("ORDER CONFIRMED")}
    <tr><td style="background:#1c1b1b;padding:36px 40px;">
      <h2 style="color:#e5e2e1;font-size:22px;margin:0 0 16px;">Asante, ${d.clientName}. Your order has been placed.</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:20px;">
        ${detailRow("ORDER ID", d.orderId.slice(-8).toUpperCase())}
        ${detailRow("PAYMENT", d.paymentMethod)}
        ${d.mpesaReceiptNumber ? detailRow("M-PESA RECEIPT", d.mpesaReceiptNumber) : ""}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:20px;">
        ${itemRows}
        <tr><td colspan="2" style="padding:14px 20px;color:#e8bf9b;font-size:16px;font-weight:bold;text-align:right;">KSh ${d.totalAmount.toLocaleString()}</td></tr>
      </table>
      ${ctaButton(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://forgetimber.tuistech.co.ke"}/dashboard`, "VIEW MY DASHBOARD &rarr;")}
    </td></tr>`);
}

function orderAdminHtml(d: { clientName: string; clientEmail: string; orderId: string; items: OrderItem[]; totalAmount: number; paymentMethod: string; mpesaReceiptNumber?: string | null }) {
  const itemRows = d.items.map(i => `
    <tr>
      <td style="padding:10px 20px;border-bottom:1px solid rgba(79,69,61,0.15);color:#e5e2e1;">${i.name} x${i.quantity}</td>
      <td style="padding:10px 20px;border-bottom:1px solid rgba(79,69,61,0.15);color:#e8bf9b;text-align:right;">KSh ${(i.price * i.quantity).toLocaleString()}</td>
    </tr>`).join("");
  return wrap(`
    ${headerHtml("NEW SHOP ORDER")}
    <tr><td style="background:#1c1b1b;padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:20px;">
        ${detailRow("ORDER ID", d.orderId.slice(-8).toUpperCase())}
        ${detailRow("CLIENT", d.clientName)}
        ${detailRow("EMAIL", d.clientEmail)}
        ${detailRow("PAYMENT", d.paymentMethod)}
        ${detailRow("TOTAL", "KSh " + d.totalAmount.toLocaleString())}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#131313;border:1px solid #4f453d;margin-bottom:20px;">
        ${itemRows}
      </table>
      ${ctaButton(`${process.env.NEXT_PUBLIC_APP_URL ?? "https://forgetimber.tuistech.co.ke"}/admin`, "OPEN ADMIN PANEL &rarr;")}
    </td></tr>`);
}