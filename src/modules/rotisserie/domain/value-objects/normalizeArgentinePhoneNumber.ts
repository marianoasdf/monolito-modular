function stripLocalMobilePrefix(digits: string): string {
  for (const areaCodeLength of [4, 3, 2]) {
    const areaCode = digits.slice(0, areaCodeLength);
    const subscriber = digits.slice(areaCodeLength);

    if (subscriber.startsWith("15")) {
      const candidate = areaCode + subscriber.slice(2);

      if (candidate.length >= 10 && candidate.length <= 11) {
        return candidate;
      }
    }
  }

  return digits;
}

export function normalizeArgentinePhoneNumber(input: string): string | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
  }

  let digits = trimmed.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("549") && digits.length >= 12 && digits.length <= 13) {
    return `+${digits}`;
  }

  let domesticDigits = digits;

  if (domesticDigits.startsWith("54")) {
    domesticDigits = domesticDigits.slice(2);
  }

  if (domesticDigits.startsWith("0")) {
    domesticDigits = domesticDigits.slice(1);
  }

  domesticDigits = stripLocalMobilePrefix(domesticDigits);

  if (domesticDigits.length >= 10 && domesticDigits.length <= 11) {
    return `+549${domesticDigits}`;
  }

  return null;
}
