const crisisPatterns = [
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bsuicide\b/i,
  /\bsuicidal\b/i,
  /\bself[- ]harm\b/i,
  /\bhurt myself\b/i,
  /\bwant to die\b/i,
  /\bimmediate danger\b/i,
  /\bcan't go on\b/i
];

export function isCrisisMessage(message: string) {
  return crisisPatterns.some((pattern) => pattern.test(message));
}
