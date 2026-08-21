import nodemailer, { type Transporter } from "nodemailer";

// Credenciais SMTP ficam só em variável de ambiente (nunca no banco nem no
// código) — Vercel (Production/Preview) + .env.local. Ver .env.example.
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("SMTP não configurado (SMTP_HOST/SMTP_USER/SMTP_PASSWORD ausentes).");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  return transporter;
}

export interface SendEmailInput {
  to: string[];
  subject: string;
  html: string;
  fromName?: string;
}

export async function sendEmail({ to, subject, html, fromName }: SendEmailInput): Promise<void> {
  const fromAddress = process.env.SMTP_USER!;
  await getTransporter().sendMail({
    from: fromName ? `"${fromName}" <${fromAddress}>` : fromAddress,
    to,
    subject,
    html,
  });
}
