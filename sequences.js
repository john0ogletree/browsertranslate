import { CHAR_MAP } from './map.js';

export const SEQUENCE_MAP = {
  "th": "th",
  "sh": "sh",
  "ch": "ch",
  "ph": "ph",
  "qu": "qu",
  "ing": "ing",
  "tion": "tion"
};

const MAX_SEQ_LEN = Math.max(
  1,
  ...Object.keys(SEQUENCE_MAP).map((k) => k.length)
);

function applyCase(source, target) {
  const lower = source.toLowerCase();
  if (source === lower) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target;
}

export function translateSequences(text, seqMap = SEQUENCE_MAP, charMap = CHAR_MAP) {
  let out = "";
  let i = 0;

  while (i < text.length) {
    let matched = false;
    const limit = Math.min(MAX_SEQ_LEN, text.length - i);

    for (let len = limit; len >= 2; len--) {
      const slice = text.slice(i, i + len);

      if (Object.prototype.hasOwnProperty.call(seqMap, slice)) {
        out += seqMap[slice];
        i += len;
        matched = true;
        break;
      }

      const lower = slice.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(seqMap, lower)) {
        out += applyCase(slice, seqMap[lower]);
        i += len;
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const ch = text[i];
    if (Object.prototype.hasOwnProperty.call(charMap, ch)) {
      out += charMap[ch];
    } else {
      const lower = ch.toLowerCase();
      const upper = ch.toUpperCase();
      if (Object.prototype.hasOwnProperty.call(charMap, lower)) {
        out += charMap[lower];
      } else if (Object.prototype.hasOwnProperty.call(charMap, upper)) {
        out += charMap[upper];
      } else {
        out += ch;
      }
    }
    i += 1;
  }

  return out;
}
