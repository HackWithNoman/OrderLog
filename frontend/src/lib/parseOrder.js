import { bengaliToAscii, digitsOnly } from './bengali.js';

/**
 * Parses the free-form text a user pastes for a single order and returns a
 * draft object: { name, address, phone, amount, note }.
 *
 * The text may be in Bengali or English and may use labels such as
 * "নাম:", "ফোন:", "মোবাইল:", "ঠিকানা:", "Name," etc. Product/variant lines
 * (e.g. "হিজাব ২ সেট", "L সাইজ") are folded into the `note` field.
 *
 * This is a best-effort parser: the result is always shown in editable form
 * fields before it is saved.
 */

const NAME_LABEL = /^(?:নাম|name)\s*[:\-।,;ːঃ]*\s*/i;
const PHONE_LABEL =
  /^(?:ফোন(?:\s*নাম্বার|\s*নম্বর)?|মোবাইল(?:\s*নাম্বার)?|phone|mobile|tel|contact)\s*[:\-।,;ːঃ]*\s*/i;
const ADDRESS_LABEL = /^(?:ঠিকানা|address|এড্রেস|addr)\s*[:\-।,;ːঃ]*\s*/i;
const DISTRICT_LABEL = /^(?:জেলা|district)\s*[:\-।,;ːঃ]*\s*/i;
const THANA_LABEL = /^(?:থানা|upazila|thana)\s*[:\-।,;ːঃ]*\s*/i;

const PRODUCT_KEYWORDS =
  /সেট|পিস|সাইজ|size|pcs|piece|regular|রেগুলার|হিজাব|hijab|xl|xxl|(?:^|\s)(?:l|m|s)(?:\s|$)/i;

/** A Bangladeshi mobile number: 11 digits starting with 01. */
function isPhoneNumber(text) {
  const digits = digitsOnly(text);
  return digits.length === 11 && /^01[3-9]/.test(digits);
}

/** Extract a numeric amount, or return null when the segment is not an amount. */
function extractAmount(segment) {
  const slash = segment.match(/(\d[\d,]*)\s*\/-/);
  if (slash) return digitsOnly(slash[1]);

  const currency =
    segment.match(/৳\s*(\d[\d,]*)/) ||
    segment.match(/(\d[\d,]*)\s*(?:tk|taka|৳)\b/i);
  if (currency) return digitsOnly(currency[1]);

  const trimmed = segment.trim();
  if (/^\d{1,6}$/.test(trimmed)) return trimmed;

  return null;
}

function isProductLine(segment) {
  return PRODUCT_KEYWORDS.test(segment);
}

function appendValue(existing, value) {
  const clean = value.trim();
  if (!clean) return existing;
  return existing ? `${existing} ${clean}` : clean;
}

export function parseOrderText(rawText = '') {
  const text = bengaliToAscii(rawText).replace(/\r/g, '');

  const segments = text
    .split(/[\n৷।]+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const result = { name: '', address: '', phone: '', amount: '', note: '' };
  const addressParts = [];
  const noteParts = [];
  const unknownParts = [];

  for (const segment of segments) {
    let label;
    let matched = true;

    if ((label = NAME_LABEL.exec(segment))) {
      result.name = appendValue(result.name, segment.slice(label[0].length));
    } else if ((label = PHONE_LABEL.exec(segment))) {
      result.phone = appendValue(result.phone, segment.slice(label[0].length));
    } else if ((label = ADDRESS_LABEL.exec(segment))) {
      addressParts.push(segment.slice(label[0].length));
    } else if ((label = DISTRICT_LABEL.exec(segment))) {
      addressParts.push(segment.slice(label[0].length));
    } else if ((label = THANA_LABEL.exec(segment))) {
      addressParts.push(segment.slice(label[0].length));
    } else {
      matched = false;
    }

    if (matched) continue;

    const amount = extractAmount(segment);
    if (amount !== null) {
      result.amount = amount;
    } else if (isPhoneNumber(segment)) {
      result.phone = digitsOnly(segment);
    } else if (isProductLine(segment)) {
      noteParts.push(segment);
    } else {
      unknownParts.push(segment);
    }
  }

  // If no labelled name was found, the first unknown chunk becomes the name.
  if (!result.name && unknownParts.length > 0) {
    result.name = unknownParts.shift();
  }

  result.address = [...addressParts, ...unknownParts]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
  result.note = noteParts.join(' ').trim();
  result.phone = digitsOnly(result.phone);
  result.amount = digitsOnly(result.amount);

  return result;
}
