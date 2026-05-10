import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';

async function deleteUserData(userId) {
  await Promise.all([
    Complaint.deleteMany({ submittedBy: userId }),
    Comment.deleteMany({ author: userId }),
    Notification.deleteMany({ recipient: userId }),
  ]);
}

// DELETE /api/users/me
export const deleteMyAccount = async (req, res) => {
  const userId = req.user._id;

  await deleteUserData(userId);
  await User.findByIdAndDelete(userId);

  res.json({ success: true, message: 'Account deleted successfully' });
};

// DELETE /api/users/:id  (admin only)
export const deleteUserByAdmin = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot delete your own admin account' });
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    return res.status(404).json({ message: 'User not found' });
  }

  await deleteUserData(target._id);
  await User.findByIdAndDelete(target._id);

  res.json({ success: true, message: 'User account deleted successfully' });
};
