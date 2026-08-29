import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

import { type Lang, defaultLang, ui } from '@/i18n/ui';

export const prerender = false;

const resolveLang = (value: FormDataEntryValue | null): Lang =>
  value === 'en' ? 'en' : defaultLang;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_PER_IP = 3;
const RATE_LIMIT_MAX_PER_EMAIL = 3;
const MAX_TRACKED_CLIENTS = 5000;

const requestLog = new Map<string, number[]>();

const pruneTrackedClients = (now: number): void => {
  if (requestLog.size <= MAX_TRACKED_CLIENTS) return;
  for (const [key, timestamps] of requestLog) {
    if (timestamps.every((timestamp) => now - timestamp >= RATE_LIMIT_WINDOW_MS)) {
      requestLog.delete(key);
    }
  }
};

const registerHit = (key: string, max: number): number => {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  );
  recent.push(now);
  requestLog.set(key, recent);
  pruneTrackedClients(now);

  if (recent.length <= max) return 0;

  const blockingTimestamp = recent[recent.length - max - 1];
  const retryAfterMs = blockingTimestamp + RATE_LIMIT_WINDOW_MS - now;
  return Math.max(1, Math.ceil(retryAfterMs / 1000));
};

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  extraHeaders?: Record<string, string>
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const honeypot = formData.get('company');
  const t = ui[resolveLang(formData.get('lang'))];

  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    return jsonResponse({ success: true, message: t['api.thanks'] }, 200);
  }

  if (typeof email !== 'string' || !email) {
    return jsonResponse({ success: false, error: t['api.emailRequired'] }, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > MAX_EMAIL_LENGTH || !emailRegex.test(normalizedEmail)) {
    return jsonResponse({ success: false, error: t['api.emailInvalid'] }, 400);
  }

  const clientKey =
    clientAddress ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const retryAfterSeconds = Math.max(
    registerHit(`ip:${clientKey}`, RATE_LIMIT_MAX_PER_IP),
    registerHit(`email:${normalizedEmail}`, RATE_LIMIT_MAX_PER_EMAIL)
  );

  if (retryAfterSeconds > 0) {
    return jsonResponse({ success: false, error: t['api.rateLimited'] }, 429, {
      'Retry-After': String(retryAfterSeconds),
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: '🎮 Nuevo Registro para Beta Privada - MariPuntos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0F766E 0%, #115E59 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MariPuntos</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Beta Privada</p>
          </div>

          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Nuevo Registro para Beta</h2>

            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px; font-weight: bold;">Email del usuario:</p>
              <p style="margin: 10px 0 0 0; color: #0F766E; font-size: 18px; font-weight: bold;">${escapeHtml(normalizedEmail)}</p>
            </div>

            <div style="margin: 20px 0; padding: 15px; background: #E6F9F7; border-left: 4px solid #0F766E; border-radius: 4px;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Fecha de registro:</strong> ${new Date().toLocaleString('es-ES', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Este usuario está interesado en formar parte de la beta privada de MariPuntos.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

            <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
              © 2026 MariPuntos - Sistema de Notificaciones
            </p>
          </div>
        </div>
      `,
    });

    return jsonResponse({ success: true, message: t['api.thanks'] }, 200);
  } catch (error) {
    console.error('Error sending email:', error);
    return jsonResponse({ success: false, error: t['api.serverError'] }, 500);
  }
};
