// src/services/emailService.js - FIXED EMAIL TEMPLATE WITH PROPER LOGO
import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

dotenv.config();

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Debug logging at startup
console.log('🔧 SendGrid Email Service Configuration:');
console.log('- API Key:', process.env.SENDGRID_API_KEY ? `Set (${process.env.SENDGRID_API_KEY.substring(0, 10)}...)` : 'Missing ❌');
console.log('- From Email:', process.env.SENDGRID_FROM_EMAIL);
console.log('- Frontend URL:', process.env.FRONTEND_URL);

class EmailService {
  // Send password reset email - MAIN METHOD with FIXED LOGO
  static async sendPasswordResetEmail(email, resetToken, firstName) {
    try {
      console.log('📧 Starting password reset email process...');
      console.log('- Recipient:', email);
      console.log('- Reset Token:', resetToken);
      console.log('- First Name:', firstName);

      const resetUrl = `${process.env.FRONTEND_URL || 'https://swift-jade.vercel.app'}/reset-password/${resetToken}`;
    //   const resetUrl = `${process.env.FRONTEND_URL || 'https://swift-jade.vercel.app'}/reset-password/${resetToken}`;
      console.log('- Reset URL:', resetUrl);

      const msg = {
        to: email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@swift.com',
          name: 'SWIFT Pool Management System'
        },
        subject: 'Reset Your SWIFT Password - Action Required',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Password Reset Request</title>
              <style>
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                    line-height: 1.6; 
                    color: #333; 
                    margin: 0; 
                    padding: 0; 
                    background-color: #f4f4f4;
                  }
                  .container { 
                    max-width: 600px; 
                    margin: 0 auto; 
                    padding: 20px; 
                  }
                  .email-wrapper {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                  }
                  .logo-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                    text-decoration: none;
                  }
                  .logo-icon {
                    position: relative;
                    margin-right: 12px;
                    display: inline-block;
                  }
                  .logo-icon::before {
                    content: '';
                    position: absolute;
                    inset: -4px;
                    background: linear-gradient(45deg, #00d4ff, #00a2ff, #0099e6);
                    border-radius: 16px;
                    opacity: 0.75;
                    filter: blur(8px);
                  }
                  .logo-image {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    background: linear-gradient(135deg, #1e293b, #334155);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                  }
                  .logo-image::after {
                    content: '';
                    position: absolute;
                    inset: 4px;
                    background: linear-gradient(135deg, #06b6d4, #0891b2);
                    border-radius: 8px;
                    opacity: 0.3;
                  }
                  .logo-emoji {
                    font-size: 24px;
                    position: relative;
                    z-index: 1;
                  }
                  .logo-text {
                    font-size: 36px;
                    font-weight: bold;
                    background: linear-gradient(45deg, #00d4ff, #00a2ff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    letter-spacing: 2px;
                  }
                  .content {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 30px;
                    margin: 20px 0;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                  }
                  .reset-button {
                    display: inline-block;
                    background: linear-gradient(45deg, #00d4ff, #00a2ff);
                    color: white !important;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    margin: 20px 0;
                    box-shadow: 0 5px 15px rgba(0, 164, 255, 0.3);
                    transition: all 0.3s ease;
                  }
                  .reset-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 164, 255, 0.4);
                    text-decoration: none;
                  }
                  .warning {
                    background: rgba(255, 193, 7, 0.2);
                    border: 1px solid rgba(255, 193, 7, 0.5);
                    border-radius: 10px;
                    padding: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                  }
                  .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    opacity: 0.9;
                  }
                  .reset-url {
                    word-break: break-all; 
                    font-size: 12px; 
                    background: rgba(255,255,255,0.2) !important; 
                    padding: 15px; 
                    border-radius: 8px;
                    color: #ffffff !important;
                    border: 1px solid rgba(255,255,255,0.3);
                    font-family: 'Courier New', monospace;
                    letter-spacing: 0.5px;
                  }
                  .reset-url a {
                    color: #00d4ff !important;
                    text-decoration: underline;
                  }
                  @media (max-width: 600px) {
                    body { padding: 10px; }
                    .email-wrapper { padding: 20px; }
                    .content { padding: 20px; }
                    .logo-text { font-size: 28px; }
                    .logo-image { width: 40px; height: 40px; }
                    .logo-emoji { font-size: 20px; }
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="email-wrapper">
                      <!-- FIXED LOGO - Matches Landing Page Design -->
                      <div class="logo-container">
                          <div class="logo-icon">
                              <div class="logo-image">
                                  <div class="logo-emoji">💧</div>
                              </div>
                          </div>
                          <div class="logo-text">SWIFT</div>
                      </div>
                      
                      <div class="content">
                          <h2 style="margin-top: 0; color: white;">Password Reset Request</h2>
                          <p>Hi ${firstName || 'there'},</p>
                          
                          <p>We received a request to reset your password for your SWIFT Pool Management account.</p>
                          
                          <a href="${resetUrl}" class="reset-button" style="color: white !important; text-decoration: none;">Reset My Password</a>
                          
                          <div class="warning">
                              <strong>⚠️ Important Security Notice:</strong><br>
                              This link will expire in <strong>5 minutes</strong> for your security.<br>
                              If you didn't request this reset, please ignore this email.
                          </div>
                          
                          <p><strong>What happens next?</strong></p>
                          <ol style="text-align: left; display: inline-block; color: white;">
                              <li>Click the "Reset My Password" button above</li>
                              <li>Create a new, strong password</li>
                              <li>Sign in with your new credentials</li>
                          </ol>
                      </div>
                      
                      <div class="footer">
                          <p style="color: white; margin-bottom: 15px;">If the button doesn't work, copy and paste this link into your browser:</p>
                          <div class="reset-url">
                              <a href="${resetUrl}" style="color: #00d4ff !important;">${resetUrl}</a>
                          </div>
                          
                          <p style="margin-top: 20px; color: rgba(255,255,255,0.8);">
                              This email was sent from SWIFT Pool Management System.<br>
                              If you have any questions, please contact your system administrator.
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
Password Reset Request - SWIFT Pool Management

Hi ${firstName || 'there'},

We received a request to reset your password for your SWIFT Pool Management account.

Reset your password by clicking this link:
${resetUrl}

IMPORTANT:
- This link expires in 5 minutes for security
- If you didn't request this reset, please ignore this email

What happens next:
1. Click the reset link above
2. Create a new, strong password  
3. Sign in with your new credentials

If the link doesn't work, copy and paste this URL into your browser:
${resetUrl}

SWIFT Pool Management System
        `
      };

      console.log('📤 Attempting to send email via SendGrid...');
      console.log('📧 Email details:', {
        to: msg.to,
        from: msg.from.email,
        subject: msg.subject
      });

      const response = await sgMail.send(msg);
      
      console.log('✅ SendGrid Success!');
      console.log('📊 Response Status:', response[0].statusCode);
      console.log('📨 Message ID:', response[0].headers['x-message-id']);
      console.log(`📧 Password reset email sent successfully to ${email}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ SendGrid Error occurred:');
      console.error('- Error Code:', error.code);
      console.error('- Error Message:', error.message);
      
      if (error.response) {
        console.error('- HTTP Status:', error.response.status);
        console.error('- Response Body:', JSON.stringify(error.response.body, null, 2));
      }
      
      // Log specific SendGrid errors
      if (error.code === 'FORBIDDEN') {
        console.error('🚨 FORBIDDEN: Check if your sender email is verified in SendGrid');
      }
      if (error.code === 'UNAUTHORIZED') {
        console.error('🚨 UNAUTHORIZED: Check your SendGrid API key');
      }
      
      throw error;
    }
  }

  // Keep all your other methods unchanged...
  static async sendSuspiciousActivityAlert(user, activity) {
    // ... existing code
  }

  static async getAdminEmails() {
    // ... existing code
  }

  // ... all other existing methods
}

export default EmailService;