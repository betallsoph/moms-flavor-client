/**
 * Thin wrappers cho các API AI của Naver (Clova STT & OCR).
 * Chỉ dùng server-side. Không expose API keys ra client.
 */

const NAVER_STT_ENDPOINT =
  process.env.NAVER_STT_ENDPOINT ??
  'https://naveropenapi.apigw.ntruss.com/recog/v1/stt';
const NAVER_OCR_ENDPOINT =
  process.env.NAVER_OCR_ENDPOINT ??
  'https://naveropenapi.apigw.ntruss.com/vision-ocr/v1/general';

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing env ${name} for Naver AI`);
  }
  return value;
}

type SttOptions = {
  lang?: string; // Kor, Eng, Jpn, Chn, Th, Sp.
};

type OcrOptions = {
  lang?: string; // ko, en, ja, zh, th, es...
};

type SttResponse = {
  text?: string;
  [key: string]: any;
};

type OcrResponse = {
  images?: any[];
  [key: string]: any;
};

export async function transcribeSpeechWithNaver(
  file: File,
  options: SttOptions = {}
): Promise<SttResponse> {
  const keyId = requireEnv(process.env.NAVER_APIGW_KEY_ID, 'NAVER_APIGW_KEY_ID');
  const key = requireEnv(process.env.NAVER_APIGW_KEY, 'NAVER_APIGW_KEY');
  const lang = options.lang || 'Kor';

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const response = await fetch(`${NAVER_STT_ENDPOINT}?lang=${encodeURIComponent(lang)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-NCP-APIGW-API-KEY-ID': keyId,
      'X-NCP-APIGW-API-KEY': key,
    },
    body: buffer,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Naver STT error ${response.status}: ${message}`);
  }

  return (await response.json()) as SttResponse;
}

export async function extractTextFromImageWithNaver(
  file: File,
  options: OcrOptions = {}
): Promise<OcrResponse> {
  const secret = requireEnv(process.env.NAVER_OCR_SECRET, 'NAVER_OCR_SECRET');
  const lang = options.lang || 'ko';
  const timestamp = Date.now();
  const requestId = `ocr-${timestamp}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const form = new FormData();
  form.set(
    'message',
    JSON.stringify({
      version: 'V1',
      requestId,
      timestamp,
      lang,
    })
  );

  const blob = new Blob([buffer], {
    type: file.type || 'application/octet-stream',
  });
  form.append('file', blob, file.name || 'upload');

  const response = await fetch(NAVER_OCR_ENDPOINT, {
    method: 'POST',
    headers: {
      'X-OCR-SECRET': secret,
    },
    body: form,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Naver OCR error ${response.status}: ${message}`);
  }

  return (await response.json()) as OcrResponse;
}
