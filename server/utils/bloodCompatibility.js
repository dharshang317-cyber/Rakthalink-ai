/**
 * Blood Compatibility Reference Matrix & Suitability Rules
 * Evaluates biological compatibility for preliminary platform matching.
 */

export const COMPATIBILITY_MATRIX = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Can only receive from O-
};

/**
 * Returns list of compatible donor blood groups for a given recipient.
 */
export const getCompatibleDonorGroups = (recipientGroup) => {
  return COMPATIBILITY_MATRIX[recipientGroup] || [];
};

/**
 * Checks if a donor blood group is biologically compatible with recipient blood group.
 */
export const isBiologicallyCompatible = (donorGroup, recipientGroup) => {
  const compatibleDonors = COMPATIBILITY_MATRIX[recipientGroup] || [];
  return compatibleDonors.includes(donorGroup);
};

/**
 * Computes Blood Group Suitability Score (0 - 100):
 * - Exact Match: 100% (Conserves universal blood for emergencies)
 * - Compatible Alternative: 80%
 * - Incompatible: 0%
 */
export const getCompatibilityScore = (donorGroup, recipientGroup) => {
  if (!donorGroup || !recipientGroup) return 0;
  if (donorGroup === recipientGroup) return 100;
  if (isBiologicallyCompatible(donorGroup, recipientGroup)) return 80;
  return 0;
};
