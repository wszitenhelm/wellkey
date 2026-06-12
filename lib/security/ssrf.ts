import { isIP } from "node:net";

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^\[::1\]$/i,
  /^::1$/i,
  /^0\.0\.0\.0$/
];

function isPrivateHost(hostname: string) {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

export function assertSafeOutboundUrl(
  target: string,
  options: {
    allowedHosts?: string[];
    protocols?: Array<"https:" | "wss:">;
  } = {}
) {
  const url = new URL(target);
  const protocols = options.protocols ?? ["https:"];
  const hostname = url.hostname.toLowerCase();

  if (!protocols.includes(url.protocol as "https:" | "wss:")) {
    throw new Error("UNSAFE_PROTOCOL");
  }

  if (isIP(hostname) || isPrivateHost(hostname)) {
    throw new Error("UNSAFE_HOST");
  }

  if (options.allowedHosts && !options.allowedHosts.includes(hostname)) {
    throw new Error("HOST_NOT_ALLOWED");
  }

  return url;
}
