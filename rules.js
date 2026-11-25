// Positional and context-aware rules
// - match: string or RegExp to find inside a word
// - replace: replacement string or function
// - position: "any" | "start" | "end" | "middle"
// - before / after: optional regex pattern required immediately before or after the match
export const RULES = [
  // Example: final "s" at the end of a word
  // { match: "s", replace: "s", position: "end" },

  // Example: "c" followed by "e", "i", or "y"
  // { match: "c", replace: "c", after: /^[eiy]/i },

  // Example: initial "un" prefix at the start of a word
  // { match: "un", replace: "un", position: "start" }
];

function applyCase(source, target) {
  const lower = source.toLowerCase();
  if (source === lower) return target;
  if (source === source.toUpperCase()) return target.toUpperCase();
  if (source[0] === source[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target;
}

function applyWordRules(word, rules) {
  let current = word;

  for (const rule of rules) {
    const pattern = rule.match instanceof RegExp
      ? new RegExp(rule.match.source, rule.match.flags.includes("g") ? rule.match.flags : rule.match.flags + "g")
      : new RegExp(rule.match.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");

    current = current.replace(pattern, (matched, offset, fullStr) => {
      const endOffset = offset + matched.length;
      const prevChar = offset > 0 ? fullStr[offset - 1] : "";
      const nextChar = endOffset < fullStr.length ? fullStr[endOffset] : "";

      // Check positional boundary constraints
      if (rule.position === "start" && offset !== 0) return matched;
      if (rule.position === "end" && endOffset !== fullStr.length) return matched;
      if (rule.position === "middle" && (offset === 0 || endOffset === fullStr.length)) return matched;

      // Check neighboring character context
      if (rule.before && !rule.before.test(prevChar)) return matched;
      if (rule.after && !rule.after.test(nextChar)) return matched;

      if (typeof rule.replace === "function") {
        return rule.replace(matched, prevChar, nextChar);
      }
      return applyCase(matched, rule.replace);
    });
  }

  return current;
}

export function applyRules(text, rules = RULES) {
  if (!rules || rules.length === 0) return text;

  // Split into words and non-word delimiters so boundaries stay exact
  const tokens = text.split(/([^\p{L}\p{N}_'-]+)/u);
  let out = "";

  for (const token of tokens) {
    if (!token) continue;
    if (/^[^\p{L}\p{N}_'-]+$/u.test(token)) {
      out += token;
    } else {
      out += applyWordRules(token, rules);
    }
  }

  return out;
}
