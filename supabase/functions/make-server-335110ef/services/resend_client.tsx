/**
 * Resend Email API client - usa fetch para compatibilidad con Deno/Edge
 * Documentación: https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailParams {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  /** Enviar más tarde: "in 1 hour", "in 24 hours", o ISO 8601 */
  schedule?: string;
}

export interface ResendResponse {
  id?: string;
  error?: { message: string };
}

async function getApiKey(): Promise<string> {
  const key = (Deno.env.get("RESEND_API_KEY") ?? "").trim();
  if (!key) {
    throw new Error("RESEND_API_KEY no configurado. Configura el secreto en Supabase: supabase secrets set RESEND_API_KEY=re_xxx");
  }
  return key;
}

/**
 * Envía un email mediante la API de Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<ResendResponse> {
  const apiKey = await getApiKey();

  const to = Array.isArray(params.to) ? params.to : [params.to];
  const body: Record<string, unknown> = {
    from: params.from,
    to,
    subject: params.subject,
  };
  if (params.html) body.html = params.html;
  if (params.text) body.text = params.text;
  if (params.replyTo) body.reply_to = params.replyTo;
  if (params.schedule) body.scheduled_at = params.schedule;

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errMsg = (data as any)?.message ?? data?.error ?? `Resend API error: ${res.status}`;
    throw new Error(errMsg);
  }

  return data as ResendResponse;
}
