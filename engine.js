import { CHAR_MAP } from './map.js';
import { SEQUENCE_MAP, translateSequences } from './sequences.js';
import { LEXICON, translateLexicon } from './lexicon.js';
import { RULES, applyRules } from './rules.js';

export function createEngine({
  charMap = CHAR_MAP,
  seqMap = SEQUENCE_MAP,
  lexicon = LEXICON,
  rules = RULES
} = {}) {
  // Wire fallback chain: sequences -> charMap
  const runSubwords = (word) => translateSequences(word, seqMap, charMap);

  // Wire word/phrase lookup -> subword fallback
  const runLexicon = (text) => translateLexicon(text, lexicon, runSubwords);

  // Full deterministic pass: lexicon -> sequences -> charMap -> contextual rules
  function translate(text) {
    if (!text) return "";
    const mapped = runLexicon(text);
    return applyRules(mapped, rules);
  }

  return {
    translate,
    layers: {
      charMap,
      seqMap,
      lexicon,
      rules
    }
  };
}

// Default ready-to-use instance
const defaultEngine = createEngine();

export function translate(text) {
  return defaultEngine.translate(text);
}
