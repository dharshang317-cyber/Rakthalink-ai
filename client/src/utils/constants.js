export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal (Within 48-72h)', color: 'blue' },
  { value: 'high', label: 'High Priority (Within 24h)', color: 'amber' },
  { value: 'urgent', label: 'Emergency / Critical (Immediate)', color: 'red' },
];

export const REQUEST_STATUS = {
  OPEN: 'OPEN',
  MATCHED: 'MATCHED',
  ACCEPTED: 'ACCEPTED',
  IN_COORDINATION: 'IN_COORDINATION',
  RESOLVED: 'RESOLVED',
  CANCELLED: 'CANCELLED',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

export const MEDICAL_DISCLAIMER = `RakthaLink AI is a technology-assisted voluntary donor discovery and coordination platform. It does not provide medical diagnosis, biological donor eligibility certification, or transfusion authorization. All compatibility matching, cross-matching tests, and donation procedures must be confirmed and executed by certified hospitals, blood banks, and licensed medical professionals.`;
