import User from '../models/User.js';

const SPECIALIZATION_GROUP_MAP = {
  'WiFi':        'Network',
  'Broadband':   'Network',
  'LAN':         'Network',
  'Internet':    'Network',

  'Plumber':      'Maintenance',
  'Electrician':  'Maintenance',
  'Carpenter':    'Maintenance',
  'Painter':      'Maintenance',
  'All-rounder':  'Maintenance',

  'Computer': 'Hardware',
  'Printer':  'Hardware',
  'Server':   'Hardware',
  'CCTV':     'Hardware',

  'Developer':   'Software',
  'IT Support':  'Software',
  'Database':    'Software',
  'Software':    'Software',
};

// PATCH /api/users/onboarding
export const completeOnboarding = async (req, res) => {
  const { name, phone, gender, age, role, specialization, experienceYears } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  if (!phone?.trim()) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Admin cannot be set through onboarding — clamp to user/staff only
  const safeRole = role === 'staff' ? 'staff' : 'user';

  const specializationGroup = SPECIALIZATION_GROUP_MAP[specialization] || '';

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      name:               name.trim(),
      phone:              phone.trim(),
      gender:             gender || '',
      age:                age || null,
      role:               safeRole,
      specialization:     specialization || '',
      specializationGroup,
      experienceYears:    experienceYears || 0,
      onboardingComplete: true,
    },
    { new: true, select: '-__v' }
  );

  res.json({ success: true, user: updated });
};
