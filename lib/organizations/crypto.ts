import crypto from "node:crypto";

function base64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function generateOrganizationCryptoMaterial() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    privateKeyEncoding: { format: "pem", type: "pkcs8" },
    publicKeyEncoding: { format: "pem", type: "spki" }
  });

  const organizationSeed = base64Url(
    crypto.createHash("sha256").update(`${publicKey}:${privateKey}`).digest()
  );

  return {
    encryptedEcPrivateKey: privateKey,
    ecPublicKey: publicKey,
    organizationSeed
  };
}

export function generateOrganizationJoinCode() {
  return base64Url(crypto.randomBytes(6)).slice(0, 8).toUpperCase();
}

export function generateEmployeeLinkMaterial(organizationSeed: string) {
  const { publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { format: "pem", type: "spki" },
    privateKeyEncoding: { format: "pem", type: "pkcs8" }
  });

  const orgScopedEmployeeId = crypto
    .createHash("sha256")
    .update(`${organizationSeed}:${publicKey}`)
    .digest("hex");

  return {
    employeePublicKey: publicKey,
    orgScopedEmployeeId
  };
}
