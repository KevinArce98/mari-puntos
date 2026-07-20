import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (typeof email !== 'string' || !email) {
    return new Response(JSON.stringify({ success: false, error: 'Email es requerido' }), {
      status: 400,
    });
  }

  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'Email inválido' }), {
      status: 400,
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
              <p style="margin: 10px 0 0 0; color: #0F766E; font-size: 18px; font-weight: bold;">${email}</p>
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

    return new Response(
      JSON.stringify({ success: true, message: '¡Gracias! Te contactaremos pronto.' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error enviando email:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error al procesar la solicitud. Por favor intenta de nuevo.',
      }),
      { status: 500 }
    );
  }
};
