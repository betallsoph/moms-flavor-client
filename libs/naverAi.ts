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

type SmartShoppingItem = {
  name: string;
  quantity: string;
  reasoning?: string;
};

export type SmartShoppingResult = {
  shopping_list: Array<{
    category: string;
    items: SmartShoppingItem[];
  }>;
  advice?: string;
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

  let buffer: Buffer;
  if (input instanceof Buffer) {
    buffer = input;
  } else {
    // input is File
    buffer = Buffer.from(await (input as File).arrayBuffer());
  }

  const response = await fetch(`${NAVER_STT_ENDPOINT}?lang=${lang}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'X-NCP-APIGW-API-KEY-ID': clientId,
      'X-NCP-APIGW-API-KEY': clientSecret,
    },
    body: new Uint8Array(buffer),
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

type RecipeIngredient = {
  name: string;
  quantity: string;
  unit: string;
};

type DishWithIngredients = {
  dishName: string;
  ingredients: RecipeIngredient[];
  isFromSavedRecipe: boolean;
};

type ShoppingRequest = {
  dishes: DishWithIngredients[];
  otherDishes: string[]; // Món không có trong công thức
  people: number;
  meals: number;
};

type SmartShoppingResultV2 = {
  fromRecipes: {
    category: string;
    items: { name: string; quantity: string; forDishes: string[] }[];
  }[];
  aiSuggestions: {
    category: string;
    items: { name: string; quantity: string; reasoning: string }[];
  }[];
  advice: string;
};

export async function generateSmartShoppingList({
  dishes,
  otherDishes,
  people,
  meals,
}: ShoppingRequest): Promise<SmartShoppingResultV2> {
  if ((!dishes || dishes.length === 0) && (!otherDishes || otherDishes.length === 0)) {
    throw new Error('Danh sách món ăn trống');
  }

  // Tổng hợp nguyên liệu từ công thức đã lưu
  const ingredientMap = new Map<string, { quantity: string; unit: string; forDishes: string[] }>();

  for (const dish of dishes) {
    if (dish.isFromSavedRecipe && dish.ingredients) {
      for (const ing of dish.ingredients) {
        const key = ing.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key)!;
          existing.forDishes.push(dish.dishName);
        } else {
          ingredientMap.set(key, {
            quantity: ing.quantity,
            unit: ing.unit,
            forDishes: [dish.dishName],
          });
        }
      }
    }
  }

  // Nhóm nguyên liệu theo category
  const categorizeIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (/thịt|gà|heo|bò|cá|tôm|mực|cua|sườn|ba chỉ/.test(lowerName)) return 'Thịt/Cá/Hải sản';
    if (/rau|cải|hành|tỏi|ớt|gừng|sả|cà|đậu|giá|nấm|khoai/.test(lowerName)) return 'Rau củ';
    if (/trứng/.test(lowerName)) return 'Trứng/Sữa';
    if (/nước mắm|muối|đường|tiêu|dầu|bột|gia vị|hạt nêm|xì dầu/.test(lowerName)) return 'Gia vị';
    return 'Khác';
  };

  const fromRecipesMap = new Map<string, { name: string; quantity: string; forDishes: string[] }[]>();

  for (const [name, data] of ingredientMap) {
    const category = categorizeIngredient(name);
    if (!fromRecipesMap.has(category)) {
      fromRecipesMap.set(category, []);
    }
    fromRecipesMap.get(category)!.push({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      quantity: `${data.quantity} ${data.unit}`.trim(),
      forDishes: data.forDishes,
    });
  }

  const fromRecipes = Array.from(fromRecipesMap.entries()).map(([category, items]) => ({
    category,
    items,
  }));

  // Tạo prompt cho AI gợi ý bổ sung
  const existingIngredients = Array.from(ingredientMap.keys()).join(', ');

  // Nếu không có món nào cần AI ước lượng, trả về kết quả trống
  if (otherDishes.length === 0) {
    return {
      fromRecipes,
      aiSuggestions: [],
      advice: 'Tất cả nguyên liệu đã có trong công thức đã lưu.',
    };
  }

  const data = await callClovaStudio(CLOVA_STUDIO_LONG_MODEL, {
    messages: [
      {
        role: 'system',
        content: `Bạn là chuyên gia nấu ăn Việt Nam.

NHIỆM VỤ: Ước lượng nguyên liệu cần thiết cho các món ăn CHƯA CÓ CÔNG THỨC.

Người dùng đã có nguyên liệu từ công thức đã lưu: ${existingIngredients || 'Không có'}

CHỈ gợi ý nguyên liệu cho các món CHƯA CÓ CÔNG THỨC.
KHÔNG gợi ý thêm món ăn kèm, đồ uống, hay tráng miệng.
KHÔNG gợi ý những nguyên liệu đã có trong danh sách trên.

QUY TẮC:
- Tính cho ${people} người, ${meals} bữa
- Dùng đơn vị chợ Việt Nam (bó, củ, gói, chai, gram, kg)
- Chỉ liệt kê nguyên liệu CHÍNH của món đó
- Không liệt kê gia vị cơ bản (muối, tiêu, đường, dầu ăn, nước mắm)

OUTPUT JSON:
{
  "aiSuggestions": [
    {
      "category": "Thịt/Cá/Rau củ/Khác",
      "items": [
        { "name": "Tên nguyên liệu", "quantity": "Số lượng", "reasoning": "Dùng cho món X" }
      ]
    }
  ],
  "advice": "Mẹo đi chợ ngắn gọn"
}`,
      },
      {
        role: 'user',
        content: `Các món CHƯA CÓ CÔNG THỨC cần ước lượng nguyên liệu: ${otherDishes.join(', ')}

Hãy liệt kê nguyên liệu cần mua cho các món này.`,
      },
    ],
    maxTokens: 1200,
    temperature: 0.4,
  });

  const output =
    data?.result?.outputText ||
    data?.result?.message?.content ||
    data?.text ||
    '';

  const cleanJson = output
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    const parsed = JSON.parse(cleanJson);
    return {
      fromRecipes,
      aiSuggestions: Array.isArray(parsed.aiSuggestions) ? parsed.aiSuggestions : [],
      advice: parsed.advice || '',
    };
  } catch (error) {
    console.warn('Failed to parse smart shopping JSON:', error, cleanJson);
    return {
      fromRecipes,
      aiSuggestions: [],
      advice: 'Không thể lấy gợi ý AI lúc này.',
    };
  }
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

type RecipeInfo = {
  id: string;
  dishName: string;
  ingredients: string[];
};

type SuggestedDish = {
  dishName: string;
  usedIngredients: string[];
  missingIngredients: string[];
  isFromSavedRecipes: boolean;
  recipeId?: string;
  matchScore: number;
};

type IngredientSuggestionResult = {
  fromSavedRecipes: SuggestedDish[];
  aiSuggestions: SuggestedDish[];
  advice?: string;
};

export async function analyzeIngredientsForRecipes(
  availableIngredients: string[],
  savedRecipes: RecipeInfo[]
): Promise<IngredientSuggestionResult> {
  const ingredientsList = availableIngredients.join(', ');
  const savedRecipesInfo = savedRecipes && savedRecipes.length > 0
    ? savedRecipes.map(r => `- ${r.dishName} (id: ${r.id}): ${r.ingredients.join(', ')}`).join('\n')
    : 'Không có công thức nào được lưu.';

  const prompt = `Người dùng CÓ SẴN các nguyên liệu này: [${ingredientsList}]

Danh sách công thức đã lưu:
${savedRecipesInfo}

NHIỆM VỤ: Gợi ý món ăn DỰA TRÊN nguyên liệu người dùng CÓ SẴN.

Trả về JSON:
{
  "fromSavedRecipes": [
    {
      "dishName": "Tên món",
      "recipeId": "ID",
      "usedIngredients": ["CHỈ nguyên liệu từ danh sách CÓ SẴN của người dùng"],
      "missingIngredients": ["nguyên liệu cần mua thêm"],
      "matchScore": 70
    }
  ],
  "aiSuggestions": [
    {
      "dishName": "Tên món mới",
      "usedIngredients": ["CHỈ nguyên liệu từ danh sách CÓ SẴN của người dùng"],
      "missingIngredients": ["nguyên liệu cần mua thêm"],
      "matchScore": 60
    }
  ],
  "advice": "Mẹo nấu ăn ngắn"
}

QUY TẮC QUAN TRỌNG:
1. usedIngredients CHỈ ĐƯỢC chứa nguyên liệu từ danh sách [${ingredientsList}] - KHÔNG ĐƯỢC bịa ra!
2. Nếu công thức đã lưu KHÔNG DÙNG nguyên liệu nào từ [${ingredientsList}] thì KHÔNG đưa vào fromSavedRecipes
3. aiSuggestions: Gợi ý 3-5 món THỰC SỰ dùng được [${ingredientsList}], ví dụ: trứng cút + thịt heo = thịt kho trứng cút
4. matchScore = (số nguyên liệu có sẵn dùng được / tổng nguyên liệu món) * 100
5. Không liệt kê gia vị cơ bản (muối, tiêu, nước mắm, dầu ăn) vào missingIngredients
6. JSON thuần, không markdown`;

  const data = await callClovaStudio(CLOVA_STUDIO_LONG_MODEL, {
    messages: [
      {
        role: 'system',
        content: 'Bạn là trợ lý nấu ăn chuyên nghiệp. Luôn trả về JSON hợp lệ, không có markdown.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    maxTokens: 2000,
  });

  const output =
    data?.result?.outputText ||
    data?.result?.message?.content ||
    data?.text ||
    '';

  try {
    const cleanJson = output.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as IngredientSuggestionResult;

    const fromSavedRecipes = (parsed.fromSavedRecipes || []).map(dish => ({
      ...dish,
      isFromSavedRecipes: true,
    }));

    const aiSuggestions = (parsed.aiSuggestions || []).map(dish => ({
      ...dish,
      isFromSavedRecipes: false,
    }));

    return {
      fromSavedRecipes,
      aiSuggestions,
      advice: parsed.advice || '',
    };
  } catch (error) {
    console.warn('Failed to parse Clova Studio JSON (Ingredients):', error, output);
    return {
      fromSavedRecipes: [],
      aiSuggestions: [],
      advice: '',
    };
  }
}

// ============================================
// EMOTIONAL SEARCH - Tìm kiếm theo cảm xúc
// ============================================

/**
 * Tạo emotion tags cho công thức khi lưu
 */
export async function generateEmotionTags(
  dishName: string,
  storyOrNote?: string
): Promise<string[]> {
  const prompt = `Phân tích món ăn và tạo emotion tags.

Món ăn: "${dishName}"
${storyOrNote ? `Câu chuyện/Ghi chú: "${storyOrNote}"` : ''}

Hãy tạo 3-5 emotion tags phù hợp với món ăn này.

Tags nên bao gồm:
- Cảm xúc: ấm áp, nhớ nhà, vui vẻ, an ủi, hạnh phúc, yêu thương...
- Hoàn cảnh: mưa lạnh, sum vầy, một mình, bận rộn, cuối tuần...
- Ký ức: tuổi thơ, mẹ nấu, bà ngoại, quê hương, ngày xưa...
- Tính chất: đơn giản, cầu kỳ, nhanh gọn, thịnh soạn...

Trả về JSON array thuần túy, ví dụ: ["ấm áp", "nhớ mẹ", "mưa lạnh", "tuổi thơ"]`;

  try {
    const data = await callClovaStudio(CLOVA_STUDIO_SHORT_MODEL, {
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia phân tích cảm xúc ẩm thực Việt Nam. Trả về JSON array thuần túy.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      maxTokens: 200,
    });

    const output =
      data?.result?.outputText ||
      data?.result?.message?.content ||
      data?.text ||
      '';

    const cleanJson = output.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (Array.isArray(parsed)) {
      return parsed.filter((tag: any) => typeof tag === 'string').slice(0, 5);
    }

    return [];
  } catch (error) {
    console.warn('Failed to generate emotion tags:', error);
    return [];
  }
}

type RecipeForEmotionSearch = {
  id: string;
  dishName: string;
  emotionTags?: string[];
  description?: string;
  specialNotes?: string;
};

type EmotionSearchResult = {
  recipeId: string;
  dishName: string;
  matchScore: number;
  matchedTags: string[];
  emotionalConnection: string;
};

/**
 * Tìm kiếm công thức theo tâm trạng người dùng
 */
export async function searchRecipesByMood(
  userMood: string,
  allRecipes: RecipeForEmotionSearch[]
): Promise<EmotionSearchResult[]> {
  if (!allRecipes || allRecipes.length === 0) {
    return [];
  }

  const recipesInfo = allRecipes
    .map(r => ({
      id: r.id,
      name: r.dishName,
      tags: r.emotionTags || [],
      notes: r.specialNotes || r.description || '',
    }))
    .slice(0, 20); // Giới hạn 20 công thức để tránh token limit

  const prompt = `Người dùng đang có tâm trạng/mong muốn: "${userMood}"

Danh sách công thức:
${JSON.stringify(recipesInfo, null, 2)}

Hãy tìm 3-5 công thức PHÙ HỢP NHẤT với tâm trạng người dùng.

Xem xét:
- emotionTags của mỗi món
- Tính chất món ăn (ấm, mát, nhanh, cầu kỳ...)
- Hoàn cảnh phù hợp

Trả về JSON:
{
  "results": [
    {
      "recipeId": "id_công_thức",
      "dishName": "Tên món",
      "matchScore": 85,
      "matchedTags": ["tag1", "tag2"],
      "emotionalConnection": "Lý do món này phù hợp với tâm trạng (1 câu ngắn)"
    }
  ]
}

Sắp xếp theo matchScore giảm dần. JSON thuần, không markdown.`;

  try {
    const data = await callClovaStudio(CLOVA_STUDIO_LONG_MODEL, {
      messages: [
        {
          role: 'system',
          content: 'Bạn là chuyên gia tâm lý ẩm thực, hiểu mối liên hệ giữa món ăn và cảm xúc. Trả về JSON hợp lệ.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      maxTokens: 800,
    });

    const output =
      data?.result?.outputText ||
      data?.result?.message?.content ||
      data?.text ||
      '';

    const cleanJson = output.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.results && Array.isArray(parsed.results)) {
      return parsed.results.map((r: any) => ({
        recipeId: r.recipeId || '',
        dishName: r.dishName || '',
        matchScore: r.matchScore || 0,
        matchedTags: Array.isArray(r.matchedTags) ? r.matchedTags : [],
        emotionalConnection: r.emotionalConnection || '',
      }));
    }

    return [];
  } catch (error) {
    console.warn('Failed to search recipes by mood:', error);
    return [];
  }
}
