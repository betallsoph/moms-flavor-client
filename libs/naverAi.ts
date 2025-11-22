/**
 * Thin wrappers cho các API AI của Naver (Clova STT & OCR).
 * Chỉ dùng server-side. Không expose API keys ra client.
 */

const NAVER_OCR_ENDPOINT =
  process.env.NAVER_OCR_ENDPOINT ??

  'https://naveropenapi.apigw.ntruss.com/vision-ocr/v1/general';
const NAVER_STT_ENDPOINT =
  process.env.NAVER_STT_ENDPOINT ||
  'https://naveropenapi.apigw.ntruss.com/recog/v1/stt';
const CLOVA_STUDIO_API_URL =
  process.env.CLOVA_STUDIO_API_URL ||
  'https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions';
const CLOVA_STUDIO_SHORT_MODEL =
  process.env.CLOVA_STUDIO_SHORT_MODEL || 'HCX-003';
const CLOVA_STUDIO_LONG_MODEL =
  process.env.CLOVA_STUDIO_LONG_MODEL || 'HCX-003';

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing env ${name} for Naver AI`);
  }
  return value;
}

type OcrOptions = {
  lang?: string; // ko, en, ja, zh, th, es...
};

type OcrResponse = {
  images?: any[];
  [key: string]: any;
};

type ClovaShortOptions = {
  lang?: string; // csr uses Eng, Kor, Jpn, etc.
};

type ClovaStudioPayload = {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  repeatPenalty?: number;
  stopBefore?: string[];
  includeAiFilters?: boolean;
};

export async function transcribeSpeechWithClova(
  input: File | Buffer,
  options: ClovaShortOptions = {}
): Promise<{ text: string; raw: any }> {
  const clientId = requireEnv(
    process.env.NAVER_CLOUD_CLIENT_ID,
    'NAVER_CLOUD_CLIENT_ID'
  );
  const clientSecret = requireEnv(
    process.env.NAVER_CLOUD_CLIENT_SECRET,
    'NAVER_CLOUD_CLIENT_SECRET'
  );
  const lang =
    options.lang ||
    process.env.NAVER_STT_LANG ||
    'Vi'; // default to Vietnamese but can be overridden

  const buffer =
    input instanceof Buffer
      ? input
      : Buffer.from(await input.arrayBuffer());

  const response = await fetch(`${NAVER_STT_ENDPOINT}?lang=${lang}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret,
    },
    body: buffer,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Clova Speech API error ${response.status}: ${message}`);
  }

  const result = await response.json();

  return {
    text: result.text || '',
    raw: result,
  };
}

async function callClovaStudio(
  modelId: string,
  payload: ClovaStudioPayload
) {
  const apiKey = requireEnv(
    process.env.CLOVA_STUDIO_API_KEY,
    'CLOVA_STUDIO_API_KEY'
  );
  const requestId = requireEnv(
    process.env.CLOVA_STUDIO_REQUEST_ID,
    'CLOVA_STUDIO_REQUEST_ID'
  );

  const url = `${CLOVA_STUDIO_API_URL}/${modelId}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-NCP-CLOVASTUDIO-REQUEST-ID': requestId,
    },
    body: JSON.stringify({
      maxTokens: 256,
      temperature: 0.4,
      topP: 0.8,
      repeatPenalty: 5.0,
      stopBefore: [],
      includeAiFilters: true,
      ...payload,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Clova Studio error ${response.status}: ${message}`);
  }

  return response.json();
}

export async function analyzeCookingStepText(text: string) {
  const data = await callClovaStudio(CLOVA_STUDIO_SHORT_MODEL, {
    messages: [
      {
        role: 'system',
        content: `
You are a professional translator and data extractor for a cooking app.
Your specific task is to process English cooking instructions and output valid JSON in VIETNAMESE.

RULES:
1. **TRANSLATE EVERYTHING TO VIETNAMESE**. Do not output English values.
2. **EXTRACT DURATION STRICTLY**: If you hear specific time (minutes, seconds, hours), put it in "duration". DO NOT put time in "note".
3. **FORMAT**: Return only raw JSON.

Field Definitions:
- "action": The main cooking activity (Verb + Object). Translate to Vietnamese.
- "duration": Time amount (e.g., "10 phút", "1 tiếng"). If none, use null.
- "note": Tips, heat level (low/high heat), warnings. Translate to Vietnamese.
`,
      },
      {
        role: 'user',
        content: `Transcript: "Boil the water for 15 minutes."`
      },
      {
        role: 'assistant',
        content: `{"action": "Đun sôi nước", "duration": "15 phút", "note": null}`
      },
      {
        role: 'user',
        content: `Transcript: "Fry the chicken carefully so oil doesn't splash."`
      },
      {
        role: 'assistant',
        content: `{"action": "Chiên gà", "duration": null, "note": "Cẩn thận để không bị bắn dầu"}`
      },
      {
        role: 'user',
        content: `Transcript: "Simmer on low heat for 1 hour."`
      },
      {
        role: 'assistant',
        content: `{"action": "Hầm", "duration": "1 tiếng", "note": "Để lửa nhỏ"}`
      },
      {
        role: 'user',
        content: `Transcript: """${text}"""`
      },
    ],
    temperature: 0.1,
    maxTokens: 300,
  });

  const output =
    data?.result?.outputText ||
    data?.result?.message?.content ||
    data?.text ||
    '';

  try {
    const cleanJson = output.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      action: parsed.action || text,
      duration: parsed.duration || '',
      note: parsed.note || '',
      raw: data,
    };
  } catch (error) {
    console.warn('Failed to parse Clova Studio JSON (Step):', error, output);
    return {
      action: text,
      duration: '',
      note: '',
      raw: data,
    };
  }
}

export async function extractFullRecipeFromSpeech(text: string) {
  const data = await callClovaStudio(CLOVA_STUDIO_LONG_MODEL, {
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant specialized in extracting recipe details from Vietnamese spoken text. Output strict JSON.',
      },
      {
        role: 'user',
        content: `
Analyze the Vietnamese transcript below and extract recipe details into JSON format:

{
  "ten_mon": "<Tên món ăn (String)>",
  "nguyen_lieu": ["<Nguyên liệu 1>", "<Nguyên liệu 2>", ...],
  "cach_lam": ["<Bước 1>", "<Bước 2>", ...],
  "bi_kip": "<Lời dặn dò, mẹo vặt hoặc cảm xúc của người nấu (String)>"
}

Constraints:
1. Output MUST be in Vietnamese.
2. If a field is missing, return null hoặc []
3. "cach_lam" should be split into logical steps.

Transcript: """${text}"""
JSON:`,
      },
    ],
    maxTokens: 1000,
    temperature: 0.2,
  });

  const output =
    data?.result?.outputText ||
    data?.result?.message?.content ||
    data?.text ||
    '';

  try {
    const cleanJson = output.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return {
      ten_mon: parsed.ten_mon || '',
      nguyen_lieu: Array.isArray(parsed.nguyen_lieu) ? parsed.nguyen_lieu : [],
      cach_lam: Array.isArray(parsed.cach_lam) ? parsed.cach_lam : [],
      bi_kip: parsed.bi_kip || '',
      raw: data,
    };
  } catch (error) {
    console.warn('Failed to parse Clova Studio JSON (Full Recipe):', error, output);
  }

  return {
    ten_mon: '',
    nguyen_lieu: [],
    cach_lam: [],
    bi_kip: '',
    raw: data,
  };
}

export async function generateNostalgiaStory({
  dishName,
  ingredients,
  mood,
}: {
  dishName: string;
  ingredients?: string[] | string;
  mood?: string;
}) {
  const trimmedDish = dishName.trim();
  const normalizeArray = (value?: string[] | string) => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }
    return value
      .split(/[,\\n]/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const ingredientList = normalizeArray(ingredients);
  const ingredientsText = ingredientList.length
    ? ingredientList.join(', ')
    : 'nguyên liệu quen thuộc';
  const moodContext = mood?.trim()
    ? `Bối cảnh/Ký ức cụ thể cần lồng ghép vào: "${mood.trim()}".`
    : 'Bối cảnh: Bữa cơm gia đình ấm cúng hàng ngày.';

  const data = await callClovaStudio(CLOVA_STUDIO_LONG_MODEL, {
    messages: [
      {
        role: 'system',
        content: `Bạn là một người mẹ/người bà Việt Nam giàu tình cảm, văn phong hoài niệm, sâu sắc.
Nhiệm vụ: Viết một đoạn văn ngắn (khoảng 3-4 câu) làm lời dẫn cho một món ăn.

Yêu cầu tuyệt đối:
1. Dựa vào "Bối cảnh/Ký ức" người dùng cung cấp để viết. Nếu bối cảnh là "Tết", hãy nói về Tết. Nếu là "Ốm", hãy nói về sự chăm sóc.
2. Nhắc khéo đến tên món và sự hòa quyện của nguyên liệu.
3. Không liệt kê công thức (ví dụ: không viết "cho 2 muỗng muối").
4. Ngôn ngữ: Tiếng Việt giàu hình ảnh, chạm đến trái tim.`,
      },
      {
        role: 'user',
        content: `Tên món: "${trimmedDish}"
Nguyên liệu chính: ${ingredientsText}
${moodContext}

Hãy viết một đoạn dẫn nhập thật cảm xúc.`,
      },
    ],
    maxTokens: 600,
    temperature: 0.75,
    topP: 0.9,
  });

  const output =
    data?.result?.outputText ||
    data?.result?.message?.content ||
    data?.text ||
    '';

  const cleaned = output
    .replace(/```(?:json)?/gi, '')
    .trim();

  return {
    story: cleaned,
    raw: data,
  };
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

export async function transcribeLongSpeechFromUrl(
  mediaUrl: string,
  options: ClovaShortOptions = {}
) {
  const fileResponse = await fetch(mediaUrl);
  if (!fileResponse.ok) {
    throw new Error(`Failed to download audio file: ${await fileResponse.text()}`);
  }
  const arrayBuffer = await fileResponse.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return transcribeSpeechWithClova(buffer, options);
}
