/**
 * Simple safety filter for AI video prompts.
 * Designed to block restricted content before it reaches the generation stage.
 */

const RESTRICTED_KEYWORDS = [
  // Child exploitation (Zero tolerance)
  "child",
  "minor",
  "kid",
  "underage",
  "school girl",
  "school boy",
  "children",
  "baby",
  "toddler",
  "infant",

  // Explicit / Sexual acts
  "porn",
  "sex",
  "naked",
  "nude",
  "erotic",
  "sexual",
  "hardcore",
  "lust",

  // Graphic violence
  "blood",
  "gore",
  "killing",
  "murder",
  "execution",
  "dead body",
  "decapitation",

  // Drugs, weapons, terrorism
  "drugs",
  "cocaine",
  "heroin",
  "weapons",
  "guns",
  "rifles",
  "terrorism",
  "terrorist",
  "bomb",
  "explosive",

  // Self-harm
  "suicide",
  "self harm",
  "cutting",
];

// Matches age numbers < 18 like "15yo", "16 year old", etc.
const AGE_PATTERN = /\b([1-9]|1[0-7])\s?(yo|year old|years old)\b/i;

export const checkPromptSafety = (
  prompt: string
): { isSafe: boolean; reason?: string } => {
  const normalizedPrompt = prompt.toLowerCase();

  // 1. Check Keywords
  for (const keyword of RESTRICTED_KEYWORDS) {
    if (normalizedPrompt.includes(keyword)) {
      return { isSafe: false, reason: "RESTRICTED_KEYWORD" };
    }
  }

  // 2. Check Age Pattern (< 18)
  if (AGE_PATTERN.test(normalizedPrompt)) {
    return { isSafe: false, reason: "UNDERAGE_CONTENT" };
  }

  return { isSafe: true };
};
