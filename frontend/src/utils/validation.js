/**
 * Lightweight client-side validation for calculator forms. This intentionally
 * does NOT contain any calorie/macro math — that logic lives only on the
 * backend (server/src/utils/calorieCalculations.js) so the two never drift.
 */
export function validateProfileFields({ age, heightCm, weightKg }) {
  const errors = {};

  if (!age || age < 13 || age > 100) errors.age = 'Enter an age between 13 and 100.';
  if (!heightCm || heightCm < 90 || heightCm > 250) errors.heightCm = 'Enter a height between 90 and 250 cm.';
  if (!weightKg || weightKg < 25 || weightKg > 300) errors.weightKg = 'Enter a weight between 25 and 300 kg.';

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
