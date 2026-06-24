export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[–—]/g, '-')           // Replace em/en dashes with hyphens
    .replace(/[^a-z0-9\s-]/g, '')    // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Collapse multiple hyphens
    .replace(/^-|-$/g, '')           // Trim leading/trailing hyphens
    .substring(0, 80);               // Max 80 chars for URL friendliness
}

export function generateOrderNumber(): string {
  const prefix = 'VN';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
