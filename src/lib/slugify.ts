/**
 * Utility for generating URL-safe, clean slugs and ensuring uniqueness.
 */

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented/special characters
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // Replace non-alphanumeric characters with a hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // Collapse multiple consecutive hyphens into one
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, "");
}

/**
 * Generates a unique slug by appending numeric suffixes if a collision occurs.
 * Example: "floral-folk-lamp" -> "floral-folk-lamp-2"
 */
export function generateUniqueSlug(
  baseName: string,
  existingSlugs: string[],
  currentId?: string
): string {
  const baseSlug = slugify(baseName) || "product";
  const normalizedExisting = existingSlugs.map((s) => (s ? s.toLowerCase() : ""));

  if (!normalizedExisting.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  while (normalizedExisting.includes(`${baseSlug}-${counter}`)) {
    counter++;
  }
  return `${baseSlug}-${counter}`;
}
