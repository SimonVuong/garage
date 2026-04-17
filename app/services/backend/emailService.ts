import "server-only";
import { Resend } from "resend";

/** Resend API key (file scope). Rotate if this repository is shared publicly. */
const RESEND_API_KEY = "re_avcAUfPE_9bS8tX8ZEUcMeESypMqgkous";

const resend = new Resend(RESEND_API_KEY);

const EMAIL_FROM = "Garage <onboarding@resend.dev>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  body: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.body,
    ...(params.attachments?.length ? { attachments: params.attachments } : {}),
  });

  if (error) {
    return { ok: false, message: error.message || "Could not send email." };
  }
  if (!data?.id) {
    return { ok: false, message: "Could not send email." };
  }
  return { ok: true };
}
