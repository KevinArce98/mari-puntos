'use server';

import nodemailer from 'nodemailer';

type State = {
  success: boolean;
  message?: string;
  error?: string;
};

export async function submitBetaSignup(
  prevState: State,
  formData: FormData
): Promise<State> {
  const email = formData.get('email') as string;

  if (!email) {
    return {
      success: false,
      error: 'Email es requerido',
    };
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: 'Email inválido',
    };
  }

  try {
    // Configurar transporter de nodemailer con Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Enviar correo
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Enviarte a ti mismo
      subject: '🎮 Nuevo Registro para Beta Privada - MariPuntos',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #24C6B1 0%, #1da896 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">MariPuntos</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 14px;">Beta Privada</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">Nuevo Registro para Beta</h2>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px; font-weight: bold;">Email del usuario:</p>
              <p style="margin: 10px 0 0 0; color: #24C6B1; font-size: 18px; font-weight: bold;">${email}</p>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #E6F9F7; border-left: 4px solid #24C6B1; border-radius: 4px;">
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

    return {
      success: true,
      message: '¡Gracias! Te contactaremos pronto.',
    };
  } catch (error) {
    console.error('Error enviando email:', error);
    return {
      success: false,
      error: 'Error al procesar la solicitud. Por favor intenta de nuevo.',
    };
  }
}
