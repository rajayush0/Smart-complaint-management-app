import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { sendEmail, emailTemplates } from '../config/nodemailer.js';

// ─────────────────────────────────────────
// CREATE COMPLAINT
// POST /api/complaints
// Access: logged in users only
// ─────────────────────────────────────────
export const createComplaint = async (req, res) => {
  const { title, description, category, priority } = req.body;

  // Build attachments array from uploaded files
  // req.files comes from multer middleware
  const attachments = req.files?.map((file) => ({
    url: file.path,              // cloudinary URL
    publicId: file.filename,     // cloudinary public ID
    originalName: file.originalname,
  })) || [];

  // Create the complaint in MongoDB
  const complaint = await Complaint.create({
    title,
    description,
    category,
    priority,
    submittedBy: req.user._id,  // from protect middleware
    attachments,
  });

  // Create in-app notification for all admins
  const admins = await User.find({ role: 'admin' });
  const notifications = admins.map((admin) => ({
    recipient: admin._id,
    type: 'complaint_submitted',
    message: `New complaint submitted: "${title}"`,
    complaint: complaint._id,
  }));
  await Notification.insertMany(notifications);

  // Send confirmation email to user
  const template = emailTemplates.complaintSubmitted(complaint);
  await sendEmail({
    to: req.user.email,
    subject: template.subject,
    html: template.html,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint submitted successfully',
    complaint,
  });
};

// ─────────────────────────────────────────
// GET ALL COMPLAINTS
// GET /api/complaints
// Access: admin/staff = all complaints
//         user = only their own complaints
// ─────────────────────────────────────────
export const getComplaints = async (req, res) => {
  // Build filter based on role
  let filter = {};

  if (req.user.role === 'user') {
    // Regular users only see their own complaints
    filter.submittedBy = req.user._id;
  } else if (req.user.role === 'staff') {
    // Staff see complaints assigned to them
    filter.assignedTo = req.user._id;
  }
  // Admin sees everything (no filter)

  // Optional filters from query string
  // e.g. /api/complaints?status=Open&priority=High
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.category) filter.category = req.query.category;

  const complaints = await Complaint.find(filter)
    .populate('submittedBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar')
    .sort({ createdAt: -1 }); // newest first

  res.json({
    success: true,
    count: complaints.length,
    complaints,
  });
};

// ─────────────────────────────────────────
// GET ONE COMPLAINT
// GET /api/complaints/:id
// Access: owner, assigned staff, admin
// ─────────────────────────────────────────
export const getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email avatar')
    .populate('assignedTo', 'name email avatar');

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Check if user has permission to view this complaint
  const isOwner = complaint.submittedBy._id.equals(req.user._id);
  const isAssigned = complaint.assignedTo?._id.equals(req.user._id);
  const isAdminOrStaff = ['admin', 'staff'].includes(req.user.role);

  if (!isOwner && !isAssigned && !isAdminOrStaff) {
    return res.status(403).json({
      message: 'Not authorized to view this complaint',
    });
  }

  res.json({ success: true, complaint });
};

// ─────────────────────────────────────────
// UPDATE COMPLAINT STATUS
// PATCH /api/complaints/:id/status
// Access: staff and admin only
// ─────────────────────────────────────────
export const updateStatus = async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email');

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Update status
  complaint.status = status;

  // If resolved, record the time
  if (status === 'Resolved') {
    complaint.resolvedAt = new Date();
  }

  await complaint.save();

  // Notify the user who submitted the complaint
  await Notification.create({
    recipient: complaint.submittedBy._id,
    type: 'status_updated',
    message: `Your complaint "${complaint.title}" status changed to ${status}`,
    complaint: complaint._id,
  });

  // Send email notification
  const template = status === 'Resolved'
    ? emailTemplates.complaintResolved(complaint)
    : emailTemplates.statusUpdated(complaint);

  await sendEmail({
    to: complaint.submittedBy.email,
    subject: template.subject,
    html: template.html,
  });

  res.json({
    success: true,
    message: 'Status updated successfully',
    complaint,
  });
};

// ─────────────────────────────────────────
// ASSIGN COMPLAINT TO STAFF
// PATCH /api/complaints/:id/assign
// Access: admin only
// ─────────────────────────────────────────
export const assignComplaint = async (req, res) => {
  const { staffId } = req.body;

  // Verify the staff member exists and has staff role
  const staff = await User.findById(staffId);
  if (!staff || staff.role !== 'staff') {
    return res.status(400).json({
      message: 'Invalid staff member',
    });
  }

  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: staffId,
      status: 'In Progress', // auto update status
    },
    { new: true }
  ).populate('submittedBy', 'name email');

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Notify the assigned staff member
  await Notification.create({
    recipient: staffId,
    type: 'complaint_assigned',
    message: `You have been assigned complaint: "${complaint.title}"`,
    complaint: complaint._id,
  });

  res.json({
    success: true,
    message: `Complaint assigned to ${staff.name}`,
    complaint,
  });
};

// ─────────────────────────────────────────
// DELETE COMPLAINT
// DELETE /api/complaints/:id
// Access: owner (if Open) or admin
// ─────────────────────────────────────────
export const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Only owner can delete their own complaint
  // Admin can delete any complaint
  const isOwner = complaint.submittedBy.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      message: 'Not authorized to delete this complaint',
    });
  }

  // Regular users can only delete Open complaints
  if (isOwner && !isAdmin && complaint.status !== 'Open') {
    return res.status(400).json({
      message: 'Cannot delete a complaint that is already being processed',
    });
  }

  // Delete attachments from Cloudinary
  for (const file of complaint.attachments) {
    await cloudinary.uploader.destroy(file.publicId);
  }

  await complaint.deleteOne();

  res.json({
    success: true,
    message: 'Complaint deleted successfully',
  });
};
