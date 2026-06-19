import { ApiError } from "@/lib/server/api/apiErrors";

const DOMAIN_PATTERN =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

export function normalizeOrganizationDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.$/, "");
}

export function parseOrganizationDomain(value: string) {
  const domain = normalizeOrganizationDomain(value);

  if (!domain) {
    throw new ApiError(400, "domain_required", "Enter a company domain.");
  }

  if (!DOMAIN_PATTERN.test(domain)) {
    throw new ApiError(
      400,
      "domain_invalid",
      "Use a valid domain like company.com or team.company.com."
    );
  }

  return domain;
}

export function getDomainVerificationHost(domain: string) {
  return domain;
}
