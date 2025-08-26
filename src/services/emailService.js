// src/services/emailService.js - COMPLETE WITH 2FA EMAIL NOTIFICATIONS
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
  // Send password reset email
  static async sendPasswordResetEmail(email, resetToken, firstName) {
    try {
      console.log('📧 Starting password reset email process...');
      console.log('- Recipient:', email);
      console.log('- Reset Token:', resetToken);
      console.log('- First Name:', firstName);

      const resetUrl = `${process.env.FRONTEND_URL || 'https://swift-jade.vercel.app'}/reset-password/${resetToken}`;
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
      
      if (error.code === 'FORBIDDEN') {
        console.error('🚨 FORBIDDEN: Check if your sender email is verified in SendGrid');
      }
      if (error.code === 'UNAUTHORIZED') {
        console.error('🚨 UNAUTHORIZED: Check your SendGrid API key');
      }
      
      throw error;
    }
  }

  // Send 2FA enabled notification
  static async send2FAEnabledNotification({ user, backupCodes = [] }) {
    try {
      console.log('🔐 Starting 2FA enabled notification email process...');
      console.log('- Recipient:', user.email);
      console.log('- User Name:', user.fname, user.lname);

      const dashboardUrl = `${process.env.FRONTEND_URL || 'https://swift-jade.vercel.app'}/dashboard`;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@swift.com',
          name: 'SWIFT Pool Management System'
        },
        subject: '🔐 Two-Factor Authentication Enabled - Your Account is More Secure!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>2FA Enabled Successfully</title>
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
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
                  .success-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                  }
                  .dashboard-button {
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
                  .info-box {
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.5);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                  }
                  .backup-codes {
                    background: rgba(245, 158, 11, 0.2);
                    border: 1px solid rgba(245, 158, 11, 0.5);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                  }
                  .backup-code {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-family: 'Courier New', monospace;
                    display: inline-block;
                    margin: 4px 8px 4px 0;
                    font-size: 14px;
                    letter-spacing: 1px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                  }
                  .security-tips {
                    background: rgba(16, 185, 129, 0.2);
                    border: 1px solid rgba(16, 185, 129, 0.5);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                  }
                  .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    opacity: 0.9;
                  }
                  @media (max-width: 600px) {
                    body { padding: 10px; }
                    .email-wrapper { padding: 20px; }
                    .content { padding: 20px; }
                    .logo-text { font-size: 28px; }
                    .logo-image { width: 40px; height: 40px; }
                    .logo-emoji { font-size: 20px; }
                    .backup-code { display: block; margin: 4px 0; }
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="email-wrapper">
                      <div class="logo-container">
                          <div class="logo-icon">
                              <div class="logo-image">
                                  <div class="logo-emoji">💧</div>
                              </div>
                          </div>
                          <div class="logo-text">SWIFT</div>
                      </div>
                      
                      <div class="content">
                          <div class="success-icon">🔐✅</div>
                          <h2 style="margin-top: 0; color: white;">Two-Factor Authentication Enabled!</h2>
                          <p>Hi ${user.fname || 'there'},</p>
                          
                          <p>Great news! Two-factor authentication (2FA) has been successfully enabled on your SWIFT Pool Management account.</p>
                          
                          <div class="info-box">
                              <h3 style="margin-top: 0; color: white;">🛡️ What this means:</h3>
                              <ul style="color: white; text-align: left;">
                                  <li>Your account is now significantly more secure</li>
                                  <li>You'll need both your password AND your authenticator app to sign in</li>
                                  <li>Protection against unauthorized access attempts</li>
                                  <li>Enhanced security for your pool management data</li>
                              </ul>
                          </div>

                          ${backupCodes && backupCodes.length > 0 ? `
                          <div class="backup-codes">
                              <h3 style="margin-top: 0; color: white;">🔑 Your Backup Codes</h3>
                              <p style="color: white; margin-bottom: 15px;"><strong>Save these codes in a secure location!</strong> You can use them to access your account if you lose your authenticator device.</p>
                              <div style="text-align: center;">
                                  ${backupCodes.map(code => `<span class="backup-code">${code}</span>`).join('')}
                              </div>
                              <p style="color: white; font-size: 14px; margin-top: 15px;"><strong>⚠️ Important:</strong> Each backup code can only be used once. Store them safely!</p>
                          </div>
                          ` : ''}
                          
                          <div class="security-tips">
                              <h3 style="margin-top: 0; color: white;">💡 Security Best Practices:</h3>
                              <ul style="color: white; text-align: left;">
                                  <li>Keep your authenticator app updated</li>
                                  <li>Don't share your backup codes with anyone</li>
                                  <li>Consider saving backup codes in a password manager</li>
                                  <li>If you get a new device, update your 2FA settings</li>
                              </ul>
                          </div>
                          
                          <a href="${dashboardUrl}" class="dashboard-button" style="color: white !important; text-decoration: none;">Access Your Dashboard</a>
                      </div>
                      
                      <div class="footer">
                          <p style="color: rgba(255,255,255,0.9);">
                              <strong>Need Help?</strong><br>
                              If you have any questions about 2FA or need assistance, please contact your system administrator.
                          </p>
                          
                          <p style="margin-top: 20px; color: rgba(255,255,255,0.8);">
                              This email was sent from SWIFT Pool Management System.<br>
                              Time: ${new Date().toLocaleString()}<br>
                              If you didn't enable 2FA, please contact support immediately.
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
🔐 Two-Factor Authentication Enabled - SWIFT Pool Management

Hi ${user.fname || 'there'},

Great news! Two-factor authentication (2FA) has been successfully enabled on your SWIFT Pool Management account.

🛡️ What this means:
- Your account is now significantly more secure
- You'll need both your password AND your authenticator app to sign in
- Protection against unauthorized access attempts
- Enhanced security for your pool management data

${backupCodes && backupCodes.length > 0 ? `
🔑 Your Backup Codes:
Save these codes in a secure location! You can use them to access your account if you lose your authenticator device.

${backupCodes.join('\n')}

⚠️ Important: Each backup code can only be used once. Store them safely!
` : ''}

💡 Security Best Practices:
- Keep your authenticator app updated
- Don't share your backup codes with anyone
- Consider saving backup codes in a password manager
- If you get a new device, update your 2FA settings

Access your dashboard: ${dashboardUrl}

Need Help?
If you have any questions about 2FA or need assistance, please contact your system administrator.

SWIFT Pool Management System
Time: ${new Date().toLocaleString()}
If you didn't enable 2FA, please contact support immediately.
        `
      };

      console.log('📤 Attempting to send 2FA enabled email via SendGrid...');
      const response = await sgMail.send(msg);
      
      console.log('✅ SendGrid Success!');
      console.log('📊 Response Status:', response[0].statusCode);
      console.log('📨 Message ID:', response[0].headers['x-message-id']);
      console.log(`🔐 2FA enabled email sent successfully to ${user.email}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ SendGrid Error occurred (2FA enabled notification):');
      console.error('- Error Code:', error.code);
      console.error('- Error Message:', error.message);
      
      if (error.response) {
        console.error('- HTTP Status:', error.response.status);
        console.error('- Response Body:', JSON.stringify(error.response.body, null, 2));
      }
      
      throw error;
    }
  }

  // Send 2FA disabled notification
  static async send2FADisabledNotification({ user }) {
    try {
      console.log('🔓 Starting 2FA disabled notification email process...');
      console.log('- Recipient:', user.email);
      console.log('- User Name:', user.fname, user.lname);

      const securityUrl = `${process.env.FRONTEND_URL || 'https://swift-jade.vercel.app'}/dashboard/security`;

      const msg = {
        to: user.email,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_FROM || 'noreply@swift.com',
          name: 'SWIFT Pool Management System'
        },
        subject: '⚠️ Two-Factor Authentication Disabled - Security Alert',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>2FA Disabled - Security Alert</title>
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
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                  .alert-icon {
                    font-size: 64px;
                    margin-bottom: 20px;
                  }
                  .security-button {
                    display: inline-block;
                    background: linear-gradient(45deg, #dc2626, #b91c1c);
                    color: white !important;
                    padding: 15px 30px;
                    text-decoration: none;
                    border-radius: 50px;
                    font-weight: bold;
                    margin: 20px 0;
                    box-shadow: 0 5px 15px rgba(220, 38, 38, 0.3);
                    transition: all 0.3s ease;
                  }
                  .security-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(220, 38, 38, 0.4);
                    text-decoration: none;
                  }
                  .warning-box {
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                  }
                  .recommendation-box {
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.5);
                    border-radius: 10px;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                  }
                  .footer {
                    margin-top: 30px;
                    font-size: 12px;
                    opacity: 0.9;
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
                      <div class="logo-container">
                          <div class="logo-icon">
                              <div class="logo-image">
                                  <div class="logo-emoji">💧</div>
                              </div>
                          </div>
                          <div class="logo-text">SWIFT</div>
                      </div>
                      
                      <div class="content">
                          <div class="alert-icon">⚠️🔓</div>
                          <h2 style="margin-top: 0; color: white;">Two-Factor Authentication Disabled</h2>
                          <p>Hi ${user.fname || 'there'},</p>
                          
                          <p>This is a security notification that two-factor authentication (2FA) has been <strong>disabled</strong> on your SWIFT Pool Management account.</p>
                          
                          <div class="warning-box">
                              <h3 style="margin-top: 0; color: white;">🚨 Security Impact:</h3>
                              <ul style="color: white; text-align: left;">
                                  <li>Your account security level has been reduced</li>
                                  <li>Only your password protects your account now</li>
                                  <li>You're more vulnerable to unauthorized access</li>
                                  <li>Consider re-enabling 2FA for better protection</li>
                              </ul>
                          </div>
                          
                          <div class="recommendation-box">
                              <h3 style="margin-top: 0; color: white;">💡 Our Recommendation:</h3>
                              <p style="color: white;">We <strong>strongly recommend</strong> re-enabling two-factor authentication to keep your pool management data secure. 2FA provides an extra layer of protection against unauthorized access.</p>
                              <ul style="color: white; text-align: left;">
                                  <li>Protects against password breaches</li>
                                  <li>Prevents unauthorized access attempts</li>
                                  <li>Industry standard for account security</li>
                                  <li>Takes only 2 minutes to set up</li>
                              </ul>
                          </div>
                          
                          <p style="color: white;"><strong>Action Details:</strong></p>
                          <ul style="text-align: left; color: white;">
                              <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                              <li><strong>Account:</strong> ${user.email}</li>
                              <li><strong>Action:</strong> 2FA Disabled</li>
                          </ul>
                          
                          <a href="${securityUrl}" class="security-button" style="color: white !important; text-decoration: none;">Review Security Settings</a>
                      </div>
                      
                      <div class="footer">
                          <p style="color: rgba(255,255,255,0.9);">
                              <strong>Didn't disable 2FA?</strong><br>
                              If you didn't disable two-factor authentication, please contact your system administrator immediately. Your account may be compromised.
                          </p>
                          
                          <p style="margin-top: 20px; color: rgba(255,255,255,0.8);">
                              This is an automated security notification from SWIFT Pool Management System.<br>
                              For support, please contact your system administrator.
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
        text: `
⚠️ Two-Factor Authentication Disabled - SWIFT Pool Management

Hi ${user.fname || 'there'},

This is a security notification that two-factor authentication (2FA) has been DISABLED on your SWIFT Pool Management account.

🚨 Security Impact:
- Your account security level has been reduced
- Only your password protects your account now
- You're more vulnerable to unauthorized access
- Consider re-enabling 2FA for better protection

💡 Our Recommendation:
We STRONGLY recommend re-enabling two-factor authentication to keep your pool management data secure. 2FA provides an extra layer of protection against unauthorized access.

Benefits of 2FA:
- Protects against password breaches
- Prevents unauthorized access attempts
- Industry standard for account security
- Takes only 2 minutes to set up

Action Details:
- Time: ${new Date().toLocaleString()}
- Account: ${user.email}
- Action: 2FA Disabled

Review your security settings: ${securityUrl}

Didn't disable 2FA?
If you didn't disable two-factor authentication, please contact your system administrator immediately. Your account may be compromised.

SWIFT Pool Management System
This is an automated security notification.
        `
      };

      console.log('📤 Attempting to send 2FA disabled email via SendGrid...');
      const response = await sgMail.send(msg);
      
      console.log('✅ SendGrid Success!');
      console.log('📊 Response Status:', response[0].statusCode);
      console.log('📨 Message ID:', response[0].headers['x-message-id']);
      console.log(`🔓 2FA disabled email sent successfully to ${user.email}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ SendGrid Error occurred (2FA disabled notification):');
      console.error('- Error Code:', error.code);
      console.error('- Error Message:', error.message);
      
      if (error.response) {
        console.error('- HTTP Status:', error.response.status);
        console.error('- Response Body:', JSON.stringify(error.response.body, null, 2));
      }
      
      throw error;
    }
  }

  // Keep all your other existing methods unchanged...
  static async sendSuspiciousActivityAlert(user, activity) {
    // ... existing code
  }

  static async getAdminEmails() {
    // ... existing code
  }

  // ... all other existing methods
}

export default EmailService;