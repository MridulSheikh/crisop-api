export const normalizeSearchQuery = (
  query: string
) => {

  return query
    .toLowerCase()

    .replace(
      /\b(price|prices|cost|buy|show|give|need|want|available|details|find|how much|online)\b/gi,
      ""
    )

    .replace(/\s+/g, " ")

    .trim();
};