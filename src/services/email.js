// This is a mock email service. In a real application, you would integrate
// a service like SendGrid, Mailgun, or use SMTP with Nodemailer.

// For now, we will just log the emails to the console.

function sendPasswordResetEmail(to, token) {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password.html?token=${token}`;
    
    console.log('--- PASSWORD RESET EMAIL ---');
    console.log(`To: ${to}`);
    console.log('Subject: Password Reset Request');
    console.log('');
    console.log('You are receiving this because you (or someone else) have requested the reset of the password for your account.');
    console.log('Please click on the following link, or paste this into your browser to complete the process:');
    console.log(resetLink);
    console.log('');
    console.log('If you did not request this, please ignore this email and your password will remain unchanged.');
    console.log('--------------------------');

    // In a real implementation, you would return a promise here.
    return Promise.resolve();
}

module.exports = {
    sendPasswordResetEmail
};
