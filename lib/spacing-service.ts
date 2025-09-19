const SERVICE_URL = process.env.SPACING_SERVICE_URL;
const API_KEY = process.env.SPACING_SERVICE_API_KEY ?? '';
const spacingCache = new Map<string, string>();

async function requestSpacing(text: string) {
  if (!SERVICE_URL) {
    throw new Error('SPACING_SERVICE_URL_NOT_CONFIGURED');
  }

  if (spacingCache.has(text)) {
    return spacingCache.get(text) as string;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.SPACING_SERVICE_TIMEOUT_MS ?? 2000));

  try {
    const res = await fetch(SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {})
      },
      body: JSON.stringify({ text }),
      signal: controller.signal,
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      throw new Error(`SPACING_SERVICE_HTTP_${res.status}`);
    }

    const payload = (await res.json()) as { text?: string; spaced?: string };
    const result = payload.spaced ?? payload.text;

    if (!result || typeof result !== 'string') {
      throw new Error('SPACING_SERVICE_EMPTY');
    }

    if (spacingCache.size > 200) {
      const firstKey = spacingCache.keys().next().value;
      spacingCache.delete(firstKey);
    }
    spacingCache.set(text, result);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function improveSpacingViaService(raw: string): Promise<string | null> {
  if (!raw || !SERVICE_URL) return null;
  try {
    return await requestSpacing(raw);
  } catch (error) {
    console.warn('Spacing service 호출 실패:', error);
    return null;
  }
}
