import User from '../models/User.js';
import Complaint from '../models/Complaint.js';

const STAFF_SELECT = 'name email avatar specialization specializationGroup experienceYears';
const VALID_GROUPS = ['Network', 'Maintenance', 'Hardware', 'Software'];

// Aggregates active (non-Resolved) complaint counts for a list of staff documents.
// Returns the same list with an `activeComplaints` field added to each entry.
async function withComplaintCounts(staffDocs) {
  if (staffDocs.length === 0) return [];

  const staffIds = staffDocs.map(s => s._id);

  const counts = await Complaint.aggregate([
    { $match: { assignedTo: { $in: staffIds }, status: { $ne: 'Resolved' } } },
    { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]));

  return staffDocs.map(s => ({
    ...s.toObject(),
    activeComplaints: countMap[s._id.toString()] || 0,
  }));
}

// GET /api/users/staff/all
// Returns all active staff sorted by experience, with their active complaint counts.
export const getAllStaff = async (req, res) => {
  const staff = await User.find({ role: 'staff', isActive: true })
    .select(STAFF_SELECT)
    .sort({ experienceYears: -1 });

  const result = await withComplaintCounts(staff);
  res.json({ success: true, count: result.length, staff: result });
};

// GET /api/users/staff/:group
// Returns active staff in a specific specializationGroup (case-insensitive).
export const getStaffByGroup = async (req, res) => {
  const normalized = VALID_GROUPS.find(
    g => g.toLowerCase() === req.params.group.toLowerCase()
  );

  if (!normalized) {
    return res.status(400).json({
      message: `Invalid group. Must be one of: ${VALID_GROUPS.join(', ')}`,
    });
  }

  const staff = await User.find({
    role: 'staff',
    isActive: true,
    specializationGroup: normalized,
  })
    .select(STAFF_SELECT)
    .sort({ experienceYears: -1 });

  const result = await withComplaintCounts(staff);
  res.json({ success: true, count: result.length, group: normalized, staff: result });
};
