import sgMail from '@sendgrid/mail';

// Configurar la API key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, // Email verificado en SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email enviado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al enviar el email:', error);
    throw error;
  }
}; 