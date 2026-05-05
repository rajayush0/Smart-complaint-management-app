import Organization from '../models/Organization.js';
import User from '../models/User.js';

// ─────────────────────────────────────────────────────────────
// CREATE ORGANIZATION
// POST /api/organizations
// Access: any authenticated user (who wants to be admin of a new org)
// ─────────────────────────────────────────────────────────────
export const createOrganization = async (req, res) => {
  const { name, description, role } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Organization name is required' });
  }

  // Create org with creator as first admin member
  const org = await Organization.create({
    name: name.trim(),
    description: description?.trim() || '',
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'admin', joinedAt: new Date() }],
  });

  // Add org to user's organizations array
  const orgEntry = { org: org._id, role: 'admin', isDefault: req.user.organizations.length === 0 };
  await User.findByIdAndUpdate(req.user._id, {
    $push: { organizations: orgEntry },
    role: 'admin',         // set global role
    onboardingComplete: true,
  });

  // Reload with populated fields
  const populated = await Organization.findById(org._id).populate('createdBy', 'name email avatar');

  res.status(201).json({ success: true, organization: populated });
};

// ─────────────────────────────────────────────────────────────
// JOIN ORGANIZATION VIA INVITE CODE
// POST /api/organizations/join
// Body: { inviteCode, role }
// Access: any authenticated user
// ─────────────────────────────────────────────────────────────
export const joinOrganization = async (req, res) => {
  const { inviteCode, role } = req.body;

  if (!inviteCode?.trim()) {
    return res.status(400).json({ message: 'Invite code is required' });
  }

  const org = await Organization.findOne({
    inviteCode: inviteCode.trim().toUpperCase(),
    isActive: true,
  });

  if (!org) {
    return res.status(404).json({ message: 'Invalid invite code. Please check and try again.' });
  }

  // Check if user is already a member
  const alreadyMember = org.members.some(m => m.user.toString() === req.user._id.toString());
  if (alreadyMember) {
    return res.status(400).json({ message: 'You are already a member of this organization.' });
  }

  const memberRole = role || 'user';

  // Add user to org members
  org.members.push({ user: req.user._id, role: memberRole, joinedAt: new Date() });
  await org.save();

  // Add org to user's organizations
  const isFirstOrg = req.user.organizations.length === 0;
  await User.findByIdAndUpdate(req.user._id, {
    $push: { organizations: { org: org._id, role: memberRole, isDefault: isFirstOrg } },
    role: memberRole,           // set global role
    onboardingComplete: true,
  });

  const populated = await Organization.findById(org._id).populate('createdBy', 'name email avatar');

  res.json({ success: true, organization: populated });
};

// ─────────────────────────────────────────────────────────────
// GET MY ORGANIZATIONS
// GET /api/organizations/mine
// Access: authenticated
// ─────────────────────────────────────────────────────────────
export const getMyOrganizations = async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'organizations.org',
    select: 'name description inviteCode createdAt members',
  });

  const orgs = user.organizations.map(entry => ({
    ...entry.org.toObject(),
    myRole: entry.role,
    isDefault: entry.isDefault,
    joinedAt: entry.joinedAt,
    memberCount: entry.org.members?.length || 0,
  }));

  res.json({ success: true, organizations: orgs });
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE ORGANIZATION DETAILS
// GET /api/organizations/:id
// Access: org member only
// ─────────────────────────────────────────────────────────────
export const getOrganization = async (req, res) => {
  const org = await Organization.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar role');

  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const isMember = org.members.some(m => m.user._id.toString() === req.user._id.toString());
  if (!isMember) return res.status(403).json({ message: 'Not a member of this organization' });

  res.json({ success: true, organization: org });
};

// ─────────────────────────────────────────────────────────────
// VALIDATE INVITE CODE (for pre-join check)
// GET /api/organizations/validate/:code
// Access: authenticated
// ─────────────────────────────────────────────────────────────
export const validateInviteCode = async (req, res) => {
  const org = await Organization.findOne({
    inviteCode: req.params.code.toUpperCase(),
    isActive: true,
  }).select('name description memberCount');

  if (!org) return res.status(404).json({ message: 'Invalid invite code' });

  res.json({ success: true, organization: { name: org.name, description: org.description } });
};

// ─────────────────────────────────────────────────────────────
// REGENERATE INVITE CODE (admin only)
// POST /api/organizations/:id/regenerate-code
// ─────────────────────────────────────────────────────────────
export const regenerateCode = async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org) return res.status(404).json({ message: 'Organization not found' });

  const adminMember = org.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
  if (!adminMember) return res.status(403).json({ message: 'Only org admins can regenerate the invite code' });

  // Force a new code
  const crypto = await import('crypto');
  org.inviteCode = crypto.default.randomBytes(4).toString('hex').toUpperCase();
  await org.save();

  res.json({ success: true, inviteCode: org.inviteCode });
};
