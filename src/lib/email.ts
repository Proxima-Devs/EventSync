import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev", 
    to: to, 
    subject: subject,
    html: html,
  });

  if (error) {
    return console.error("Détail erreur Resend:", error);
  }
  console.log("Email envoyé !", data);
}