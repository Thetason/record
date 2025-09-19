let processor: any = null;
let isUnavailable = false;

function loadProcessor() {
  if (processor || isUnavailable) return processor;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('open-korean-text-node');
    processor = mod?.default ?? mod?.OpenKoreanTextProcessor ?? mod;
    if (!processor) {
      throw new Error('open-korean-text-node does not export a processor');
    }
  } catch (error) {
    console.warn('open-korean-text-node 로딩 실패:', error);
    isUnavailable = true;
  }
  return processor;
}

export function improveKoreanSpacing(text: string): string {
  if (!text || typeof text !== 'string') return text;
  const instance = loadProcessor();
  if (!instance) {
    return text;
  }

  try {
    const normalized = instance.normalize(text).toString();
    const tokens = instance.tokenize(normalized);
    const detokenized = instance.detokenize(tokens).toString();
    return detokenized || text;
  } catch (error) {
    console.warn('한글 띄어쓰기 보정 실패:', error);
    return text;
  }
}
