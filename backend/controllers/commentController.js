import Comment from '../models/Comment.js';
import Complaint from '../models/Complaint.js';
import Notification from '../models/Notification.js';

// ─────────────────────────────────────────
// ADD COMMENT
// POST /api/complaints/:id/comments
// Access: any logged in user
// ─────────────────────────────────────────
export const addComment = async (req, res) => {
  const { text, isInternal } = req.body;

  // Find the complaint first
  const complaint = await Complaint.findById(req.params.id)
    .populate('submittedBy', 'name email');

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Only staff/admin can post internal comments
  if (isInternal && req.user.role === 'user') {
    return res.status(403).json({
      message: 'Only staff and admin can post internal comments',
    });
  }

  // Create the comment
  const comment = await Comment.create({
    complaint: req.params.id,
    author: req.user._id,
    text,
    isInternal: isInternal || false,
  });

  // Populate author info before sending back
  await comment.populate('author', 'name email avatar role');

  // Notify complaint owner when staff/admin comments
  // (don't notify if owner comments on their own complaint)
  const isOwner = complaint.submittedBy._id.equals(req.user._id);
  if (!isOwner && !isInternal) {
    await Notification.create({
      recipient: complaint.submittedBy._id,
      type: 'comment_added',
      message: `${req.user.name} commented on your complaint "${complaint.title}"`,
      complaint: complaint._id,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment,
  });
};

// ─────────────────────────────────────────
// GET ALL COMMENTS FOR A COMPLAINT
// GET /api/complaints/:id/comments
// Access: any logged in user
// ─────────────────────────────────────────
export const getComments = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found' });
  }

  // Build filter
  let filter = { complaint: req.params.id };

  // Regular users cannot see internal comments
  if (req.user.role === 'user') {
    filter.isInternal = false;
  }

  const comments = await Comment.find(filter)
    .populate('author', 'name email avatar role')
    .sort({ createdAt: 1 }); // oldest first (like a chat)

  res.json({
    success: true,
    count: comments.length,
    comments,
  });
};

// ─────────────────────────────────────────
// DELETE COMMENT
// DELETE /api/complaints/:id/comments/:commentId
// Access: comment author or admin
// ─────────────────────────────────────────
export const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  // Only author or admin can delete
  const isAuthor = comment.author.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({
      message: 'Not authorized to delete this comment',
    });
  }

  await comment.deleteOne();

  res.json({
    success: true,
    message: 'Comment deleted successfully',
  });
};
