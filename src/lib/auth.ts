import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink } from "better-auth/plugins";
import prisma from "@/lib/prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [
    admin({ defaultRole: "user" }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Votre lien de connexion EventSync",
          html: `
          <div style="font-family: Inter, Arial, sans-serif; background-color: #f9fafb; padding: 40px;">
            <div style="max-width: 500px; margin: auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); text-align: center;">
              
              <h2 style="color: #111827; margin-bottom: 10px;">Connexion à EventSync</h2>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
                Cliquez sur le bouton ci-dessous pour vous connecter en toute sécurité.
              </p>

              <a href="${url}" 
                style="display: inline-block; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                Se connecter
              </a>

              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                Ce lien expirera dans quelques minutes.<br/>
                Si vous n’avez pas demandé cette connexion, ignorez cet email.
              </p>

              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

              <p style="color: #9ca3af; font-size: 12px;">
                Ou copiez-collez ce lien dans votre navigateur :<br/>
                <a href="${url}" style="color: #4f46e5;">${url}</a>
              </p>
            </div>
          </div>
        `
        });
      },
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "user" },
    },
  },
});