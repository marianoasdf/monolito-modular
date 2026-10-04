export function sanitizeTemplateTextParameter(value: string): string {
  return value
    .replace(/\r\n|\r|\n|\t/g, " ")
    .replace(/ {5,}/g, "    ");
}
