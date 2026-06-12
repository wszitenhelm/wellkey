function slugifyPart(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function createOrganizationSlug(companyName: string, code: string) {
  const base = slugifyPart(companyName) || "company";
  return `${base}-${code.toLowerCase()}`;
}
