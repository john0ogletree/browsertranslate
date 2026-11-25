import { translateSequences } from './sequences.js';

// Whole-word and multi-word phrase overrides (exact matches before subword breakdown)
export const LEXICON = {
  "hello": "hello",
  "world": "world",
  "thank you": "thank you",
  "good morning": "good morning"
};

function applyCase(source, target) {
  const lower = source.toLowerCase();
  if (source === lower) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target;
}

// Build a lookup of multi-word phrases sorted longest-first
function getSortedPhrases(lexicon) {
  return Object.keys(lexicon)
    .filter((k) => k.includes(" "))
    .sort((a, b) => b.length - a.length);
}

export function translateLexicon(text, lexicon = LEXICON, fallback = translateSequences) {
  // 1. Replace multi-word phrases first (case-insensitive, word-bounded)
  const phrases = getSortedPhrases(lexicon);
  const placeholders = [];
  let working = text;

  for (const phrase of phrases) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    working = working.replace(regex, (match) => {
      const token = `\uE000${placeholders.length}\uE001`;
      placeholders.push(applyCase(match, lexicon[phrase]));
      return token;
    });
  }

  // 2. Tokenize remaining text into words vs. whitespace/punctuation
  const parts = working.split(/(\uE000\d+\uE001|[^\p{L}\p{N}_'-]+)/u);
  let out = "";

  for (const part of parts) {
    if (!part) continue;

    // Restore matched multi-word phrase
    if (part.startsWith("\uE000") && part.endsWith("\uE001")) {
      const idx = Number(part.slice(1, -1));
      out += placeholders[idx];
      continue;
    }

    // Pass whitespace and punctuation through unchanged
    if (/^[^\p{L}\p{N}_'-]+$/u.test(part)) {
      out += part;
      continue;
    }

    // 3. Check exact single-word match in LEXICON
    if (Object.prototype.hasOwnProperty.call(lexicon, part)) {
      out += lexicon[part];
      continue;
    }

    const lower = part.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(lexicon, lower)) {
      out += applyCase(part, lexicon[lower]);
      continue;
    }

    // 4. Delegate unknown words to sequences.js -> map.js
    out += fallback(part);
  }

  return out;
}
