import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string; }) {
  const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[sendEmail] Détail erreur Resend:", error);
    throw new Error(`Échec d'envoi d'email: ${error.message}`);
  }
  console.log("[sendEmail] Email envoyé !", data);
}