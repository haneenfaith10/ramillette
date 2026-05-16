
export const findBestCountryMatch = (detectedCountryCode, availableCountries) => {
  if (!availableCountries || availableCountries.length === 0) return null;

  // 1. Try to find an exact match for the detected country
  if (detectedCountryCode) {
    const matched = availableCountries.find(
      (c) => c.code?.toLowerCase() === detectedCountryCode.toLowerCase()
    );
    if (matched) return matched;
  }

  // 2. If no match, try to find Qatar (QA) as specifically requested
  const qatar = availableCountries.find(
    (c) => c.code?.toLowerCase() === 'qa'
  );
  if (qatar) return qatar;

  // 3. Fallback to the country marked as 'isPrimary' in the CMS
  const primary = availableCountries.find((c) => c.isPrimary);
  if (primary) return primary;

  // 4. Last resort: return the first available country
  return availableCountries[0];
};
