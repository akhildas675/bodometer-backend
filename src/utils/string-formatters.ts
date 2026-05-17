export const generateKeySlug = (text: string): string => {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s-]+/g, "_")
    .substring(0, 50);

  return base.replace(/_+/g, "_");
};

export const generateOptionValue = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "")
    .replace(/[\s-]+/g, "_");
};