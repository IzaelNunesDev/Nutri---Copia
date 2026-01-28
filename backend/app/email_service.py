"""
Email service for sending password reset and other notification emails.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging

from app.config import settings

logger = logging.getLogger(__name__)


def is_email_configured() -> bool:
    """Check if email settings are properly configured."""
    return bool(
        settings.SMTP_HOST and 
        settings.SMTP_USER and 
        settings.SMTP_PASSWORD and 
        settings.SMTP_FROM_EMAIL
    )


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    """
    Send password reset email with the reset link.
    
    Args:
        to_email: Recipient email address
        reset_token: JWT token for password reset
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    if not is_email_configured():
        logger.warning("Email service not configured. Cannot send password reset email.")
        return False
    
    reset_link = f"{settings.frontend_url_parsed}/reset-password?token={reset_token}"
    
    # Create HTML email content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #3b82f6, #6366f1);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f8fafc;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .button {{
                display: inline-block;
                background: #3b82f6;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
            }}
            .button:hover {{
                background: #2563eb;
            }}
            .warning {{
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 15px;
                margin: 20px 0;
                border-radius: 0 8px 8px 0;
            }}
            .footer {{
                text-align: center;
                color: #64748b;
                font-size: 12px;
                margin-top: 20px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>NutriPré</h1>
            <p>Recuperação de Senha</p>
        </div>
        <div class="content">
            <h2>Olá!</h2>
            <p>Recebemos uma solicitação para redefinir a senha da sua conta NutriPré.</p>
            <p>Clique no botão abaixo para criar uma nova senha:</p>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Redefinir Minha Senha</a>
            </div>
            
            <div class="warning">
                <strong>⚠️ Atenção:</strong> Este link é válido por apenas 1 hora. 
                Após esse período, você precisará solicitar um novo link de recuperação.
            </div>
            
            <p>Se você não solicitou a redefinição de senha, ignore este email. 
            Sua senha permanecerá inalterada.</p>
            
            <p>Se o botão não funcionar, copie e cole o link abaixo no seu navegador:</p>
            <p style="word-break: break-all; color: #3b82f6; font-size: 12px;">
                {reset_link}
            </p>
        </div>
        <div class="footer">
            <p>Este é um email automático. Por favor, não responda.</p>
            <p>© 2026 NutriPré - Sistema de Acompanhamento Nutricional para Gestantes</p>
        </div>
    </body>
    </html>
    """
    
    # Plain text fallback
    text_content = f"""
    NutriPré - Recuperação de Senha
    
    Olá!
    
    Recebemos uma solicitação para redefinir a senha da sua conta NutriPré.
    
    Para criar uma nova senha, acesse o link abaixo:
    {reset_link}
    
    ⚠️ ATENÇÃO: Este link é válido por apenas 1 hora.
    
    Se você não solicitou a redefinição de senha, ignore este email.
    
    ---
    Este é um email automático. Por favor, não responda.
    © 2026 NutriPré
    """
    
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "NutriPré - Recuperação de Senha"
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        
        # Attach both plain text and HTML versions
        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"Password reset email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Unexpected error sending email: {e}")
        return False


def send_email_with_pdf(to_email: str, subject: str, body: str, pdf_content: bytes, filename: str = "relatorio.pdf") -> bool:
    """
    Send an email with a PDF attachment.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Email body (plain text or HTML)
        pdf_content: The PDF bytes
        filename: Name of the attached file
        
    Returns:
        True if email was sent successfully, False otherwise
    """
    if not is_email_configured():
        logger.warning("Email service not configured. Cannot send PDF email.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email
        
        # Attach body text
        msg.attach(MIMEText(body, "html", "utf-8"))
        
        # Attach PDF
        from email.mime.application import MIMEApplication
        attachment = MIMEApplication(pdf_content, _subtype="pdf")
        attachment.add_header('Content-Disposition', 'attachment', filename=filename)
        msg.attach(attachment)
        
        # Send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        logger.info(f"PDF email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send PDF email: {e}")
        return False

