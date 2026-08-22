/**
 * ============================================================================
 * RAKTHALINK AI - AUTOMATED UNIT & INTEGRATION TEST SUITE
 * ============================================================================
 */

import { COMPATIBILITY_MATRIX, isBiologicallyCompatible, getCompatibilityScore } from '../utils/bloodCompatibility.js';
import { calculateDistanceKm, getProximityScore } from '../utils/haversine.js';
import { fallbackExtractRequest } from '../config/aiConfig.js';

let passedTests = 0;
let totalTests = 0;

const assert = (condition, testName) => {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
  }
};

console.log('\n====================================================');
console.log('🧪 RUNNING RAKTHALINK AI SYSTEM VERIFICATION TESTS');
console.log('====================================================\n');

// 1. Biological Compatibility Matrix Tests
console.log('🩸 Testing Biological Blood Group Compatibility Matrix...');
assert(isBiologicallyCompatible('O-', 'A+'), 'Universal donor O- is compatible with A+');
assert(isBiologicallyCompatible('O-', 'AB+'), 'Universal donor O- is compatible with AB+');
assert(isBiologicallyCompatible('AB+', 'AB+'), 'AB+ is compatible with AB+');
assert(!isBiologicallyCompatible('A+', 'O+'), 'A+ cannot donate to O+ (Incompatible)');
assert(!isBiologicallyCompatible('B+', 'A-'), 'B+ cannot donate to A- (Incompatible)');
assert(getCompatibilityScore('O+', 'O+') === 100, 'Exact match O+ to O+ yields 100% suitability');
assert(getCompatibilityScore('O-', 'A+') === 80, 'Universal alternative O- to A+ yields 80% suitability');

// 2. Haversine Geodesic Distance Formula Tests
console.log('\n🌐 Testing Haversine Geodesic Distance Formula...');
const coimbatoreGandhipuram = [76.9634, 11.0168]; // [lng, lat]
const coimbatoreRSPuram = [76.9458, 11.0084]; // [lng, lat]
const distanceKm = calculateDistanceKm(coimbatoreGandhipuram, coimbatoreRSPuram);

assert(distanceKm !== null && distanceKm > 1 && distanceKm < 5, `Distance calculation between Gandhipuram & RS Puram is valid (${distanceKm} km)`);
assert(getProximityScore(3.5) === 100, 'Distance <= 5 km yields 100% proximity score');
assert(getProximityScore(12) === 85, 'Distance <= 15 km yields 85% proximity score');
assert(getProximityScore(null, true) === 60, 'Coordinates missing but same city yields 60% proximity fallback');

// 3. AI Natural Language Extractor Tests
console.log('\n🤖 Testing AI Natural Language Request Extractor...');
const samplePrompt = 'Emergency: 2 units of O positive blood needed at KMCH Hospital Coimbatore tomorrow for surgery';
const extracted = fallbackExtractRequest(samplePrompt);

assert(extracted.bloodGroup === 'O+', 'Extracted blood group is O+');
assert(extracted.unitsRequired === 2, 'Extracted units required is 2');
assert(extracted.hospitalName.includes('KMCH Hospital'), 'Extracted hospital name contains KMCH Hospital');
assert(extracted.city === 'Coimbatore', 'Extracted city is Coimbatore');
assert(extracted.urgency === 'urgent', 'Detected urgency level is urgent');

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error('❌ Some tests failed. Please review the errors above.\n');
  process.exit(1);
}
