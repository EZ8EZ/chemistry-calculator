import { Resend } from "resend";
import type { RenderedEmail } from "./render";

const FROM_ADDRESS = process.env.DIGEST_FROM_ADDRESS || "Chem Digest <digest@chem-news.example.com>";

let resendClient: Resend | null = null;
function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendDigestEmail(to: string, email: RenderedEmail): Promise<string> {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
  if (error) throw new Error(`Resend send failed: ${error.message}`);
  if (!data) throw new Error("Resend returned no data");
  return data.id;
}
