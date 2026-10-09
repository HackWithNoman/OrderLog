/**
 * Helpers for dealing with Bengali text and digits.
 */

const BENGALI_DIGITS = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

/**
 * Convert Bengali digits (০-৯) in a string to ASCII digits (0-9).
 * Example: "১২৩০" -> "1230"
 */
export function bengaliToAscii(text = '') {
  return String(text).replace(/[০-৯]/g, (digit) => BENGALI_DIGITS[digit]);
}

/** Keep only the digit characters of a string. */
export function digitsOnly(text = '') {
  return String(text).replace(/\D/g, '');
}
