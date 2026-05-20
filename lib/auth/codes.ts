import crypto from "node:crypto";

const recoveryWords = [
  "forest",
  "lamp",
  "river",
  "shore",
  "cedar",
  "drift",
  "echo",
  "stone",
  "field",
  "glow"
];

function pickWord(words: string[]) {
  return words[crypto.randomInt(0, words.length)];
}

function pickDigits(length: number) {
  return Array.from({ length }, () => crypto.randomInt(0, 10)).join("");
}

export function createRecoveryCode() {
  return `${pickWord(recoveryWords)}-${pickWord(recoveryWords)}-${pickWord(recoveryWords)}-${pickDigits(2)}`;
}

export function normalizeLoginCode(value: string) {
  return value.trim().toLowerCase();
}

export function hashIdentifier(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
