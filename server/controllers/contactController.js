import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

const TARGET_EMAIL = process.env.CONTACT_EMAIL || 'pchossam11@gmail.com';
const TARGET_PHONE = process.env.CONTACT_PHONE || '+212614351030';

// Configure email transporter
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback / standard Gmail SMTP if user provides EMAIL_USER and EMAIL_PASS
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return null;
};

// @desc    Submit contact message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs obligatoires (nom, email, sujet, message)',
      });
    }

    // 1. Save to MongoDB database
    const contact = await Contact.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : '',
    });

    // 2. Send email notification to pchossam11@gmail.com
    const transporter = createTransporter();
    let emailSent = false;

    if (transporter) {
      try {
        const mailOptions = {
          from: `"ReserverDark Contact" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@reserverdark.ma'}>`,
          to: TARGET_EMAIL,
          replyTo: email,
          subject: `[ReserverDark Contact] ${subject} - de ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #2563EB; color: #ffffff; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 22px;">Nouveau Message de Contact</h2>
                <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Reçu depuis ReserverDark</p>
              </div>
              <div style="padding: 24px; background-color: #ffffff;">
                <p style="margin: 0 0 12px; font-size: 15px;"><strong>Nom :</strong> ${name}</p>
                <p style="margin: 0 0 12px; font-size: 15px;"><strong>Email :</strong> <a href="mailto:${email}" style="color: #2563EB;">${email}</a></p>
                ${phone ? `<p style="margin: 0 0 12px; font-size: 15px;"><strong>Téléphone :</strong> <a href="tel:${phone}" style="color: #2563EB;">${phone}</a></p>` : ''}
                <p style="margin: 0 0 12px; font-size: 15px;"><strong>Sujet :</strong> ${subject}</p>
                <div style="margin-top: 20px; padding: 16px; background-color: #f8fafc; border-left: 4px solid #2563EB; border-radius: 6px;">
                  <p style="margin: 0 0 6px; font-weight: bold; color: #334155;">Message :</p>
                  <p style="margin: 0; white-space: pre-line; color: #1e293b; font-size: 14px; line-height: 1.6;">${message}</p>
                </div>
              </div>
              <div style="background-color: #f1f5f9; padding: 14px; text-align: center; font-size: 12px; color: #64748b;">
                Message envoyé à <strong>${TARGET_EMAIL}</strong> & notifiable sur <strong>${TARGET_PHONE}</strong>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailError) {
        console.warn('Could not send email via SMTP transporter:', mailError.message);
      }
    }

    // 3. Automated FormSubmit fallback to ensure direct delivery to pchossam11@gmail.com
    try {
      await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5173',
          'Referer': 'http://localhost:5173/'
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || 'Non renseigné',
          _subject: `[ReserverDark] Nouveau message de ${name}: ${subject}`,
          message,
        })
      });
      emailSent = true;
    } catch (fsErr) {
      console.warn('FormSubmit delivery notice:', fsErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message reçu et enregistré avec succès !',
      contactId: contact._id,
      emailSent,
      targetEmail: TARGET_EMAIL,
      targetPhone: TARGET_PHONE,
    });
  } catch (error) {
    console.error('Error in submitContactMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message,
    });
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact
// @access  Private (Admin only)
export const getContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
