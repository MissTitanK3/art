export async function safeErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof (data as any).error === "string")
      return (data as any).error;
  } catch {
    /* ignore */
  }
  try {
    const text = await res.text();
    if (text) return text;
  } catch {
    /* ignore */
  }
  return `Request failed (${res.status})`;
}
