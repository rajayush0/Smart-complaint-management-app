import nodemailer from 'nodemailer';

// Create reusable transporter
// Think of this as your email client (like Gmail app)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper function to send emails
export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ComplaintSys" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    // Don't crash the app if email fails
    // Just log the error and continue
    console.error(`❌ Email failed: ${err.message}`);
  }
};

// Email templates
export const emailTemplates = {

  // When complaint is submitted
  complaintSubmitted: (complaint) => ({
    subject: `Complaint Received: ${complaint.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Complaint Received ✅</h2>
        <p>Your complaint has been successfully submitted.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>Category:</strong> ${complaint.category}</p>
          <p><strong>Priority:</strong> ${complaint.priority}</p>
          <p><strong>Status:</strong> ${complaint.status}</p>
        </div>
        <p>We will update you as soon as your complaint is reviewed.</p>
        <p style="color: #6b7280; font-size: 12px;">ComplaintSys Team</p>
      </div>
    `,
  }),

  // When status is updated
  statusUpdated: (complaint) => ({
    subject: `Complaint Update: ${complaint.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Complaint Status Updated 🔄</h2>
        <p>Your complaint status has been updated.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>New Status:</strong> ${complaint.status}</p>
          <p><strong>Priority:</strong> ${complaint.priority}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">ComplaintSys Team</p>
      </div>
    `,
  }),

  // When complaint is resolved
  complaintResolved: (complaint) => ({
    subject: `Complaint Resolved: ${complaint.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Complaint Resolved ✅</h2>
        <p>Your complaint has been resolved!</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
          <p><strong>Title:</strong> ${complaint.title}</p>
          <p><strong>Status:</strong> ${complaint.status}</p>
        </div>
        <p>Thank you for your patience.</p>
        <p style="color: #6b7280; font-size: 12px;">ComplaintSys Team</p>
      </div>
    `,
  }),

};

export default transporter;