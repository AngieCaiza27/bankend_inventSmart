// src/config/email.config.js
const sgMail = require('@sendgrid/mail');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Función para enviar el código de recuperación
const sendResetCode = async (email, code) => {
    const msg = {
        to: email,
        from: {
            email: process.env.EMAIL_FROM,
            name: process.env.EMAIL_FROM_NAME
        },
        subject: 'Recuperación de Contraseña - InventSmart',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">🔐 InventSmart</h1>
                </div>
                
                <div style="background-color: #f8fafc; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Recuperación de Contraseña</h2>
                    <p style="color: #475569; font-size: 16px; line-height: 1.5;">
                        Has solicitado restablecer tu contraseña. Utiliza el siguiente código de verificación:
                    </p>
                    
                    <div style="background-color: white; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; font-family: 'Courier New', monospace;">
                            ${code}
                        </div>
                    </div>
                    
                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-top: 20px;">
                        <p style="color: #92400e; margin: 0; font-size: 14px;">
                            ⏱️ <strong>Este código expira en 15 minutos</strong>
                        </p>
                    </div>
                    
                    <p style="color: #64748b; font-size: 14px; margin-top: 25px;">
                        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #94a3b8; font-size: 12px; margin: 5px 0;">
                        © 2025 InventSmart - Sistema de Gestión de Inventarios
                    </p>
                    <p style="color: #cbd5e1; font-size: 11px; margin: 5px 0;">
                        Este es un correo automático, por favor no responder.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Email enviado exitosamente a:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Error al enviar email:', error);
        if (error.response) {
            console.error('Detalle:', error.response.body);
        }
        return { success: false, error };
    }
};

module.exports = { sendResetCode };