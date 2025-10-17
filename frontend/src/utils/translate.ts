// Minimal client for LibreTranslate (free/open-source). For production, proxy via backend.
// Docs: https://libretranslate.com

export async function translateText(text: string, target: string, source: string = 'auto'): Promise<string> {
  try {
    if (!text || target === 'en') return text;
    const res = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source, target, format: 'text' })
    });
    if (!res.ok) return text;
    const data = await res.json();
    return (data && data.translatedText) || text;
  } catch {
    return text; // graceful fallback
  }
}




