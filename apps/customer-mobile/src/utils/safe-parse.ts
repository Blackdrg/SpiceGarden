export function safeParse<T = unknown>(json: string): T | undefined {
  try {
    return JSON.parse(json) as T;
  } catch {
    return undefined;
  }
}
