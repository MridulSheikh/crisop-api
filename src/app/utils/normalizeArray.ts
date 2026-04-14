export const normalizeArray = (value: unknown) => {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  return [value]; // single → array বানায়
};

export const parseToArray = (val: unknown) => {
  val = normalizeArray(val)
  if (!val) return [];

  // already array
  if (Array.isArray(val)) return val;

  // single string
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);

      // if JSON array
      if (Array.isArray(parsed)) return parsed;

      // single value
      return [parsed];
    } catch {
      return [val];
    }
  }

  return [];
};