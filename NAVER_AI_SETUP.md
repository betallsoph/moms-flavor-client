# 🤖 Naver AI (STT & OCR) Setup

Server-side wrappers cho Clova Speech-to-Text và Vision OCR.

## 🔑 Environment variables
Add vào `.env.local`:
```env
# CSR (CLOVA Speech Recognition) qua API Gateway
NAVER_STT_ENDPOINT=https://naveropenapi.apigw.ntruss.com/recog/v1/stt
NAVER_CLOUD_CLIENT_ID=your_client_id
NAVER_CLOUD_CLIENT_SECRET=your_client_secret

# Object Storage (dùng lưu file ghi âm toàn bộ)
CLOVA_LONG_BUCKET=moms-flavor-media
CLOVA_LONG_INPUT_PREFIX=audio/input
CLOVA_LONG_OUTPUT_PREFIX=audio/output

# CLOVA Studio (HyperCLOVA X)
CLOVA_STUDIO_API_KEY=...
CLOVA_STUDIO_REQUEST_ID=...
CLOVA_STUDIO_API_URL=https://clovastudio.stream.ntruss.com/testapp/v1/chat-completions
CLOVA_STUDIO_SHORT_MODEL=HCX-003
CLOVA_STUDIO_LONG_MODEL=HCX-003

# OCR
NAVER_OCR_SECRET=your_ocr_secret
NAVER_OCR_ENDPOINT=https://naveropenapi.apigw.ntruss.com/vision-ocr/v1/general # optional override
```
## 🛠️ Server routes
- `POST /api/naver/stt`  
  - FormData: `file` (audio webm/wav/mp3 ≤15MB), optional `lang` (`en-US`).  
  - Trả về: `{ success, text, raw }` (CLOVA Speech short)
- `POST /api/naver/stt/long`  
  - JSON: `{ audioUrl, lang }` (audioUrl là file trên Object Storage, lang `en-US`).  
  - Trả về: `{ success, text, steps[], overallNote }`
- `POST /api/clova/steps/analyze`  
  - JSON: `{ text }`. HyperCLOVA phân tích và trả `{ title, note, tags[] }`.
- `POST /api/naver/ocr`  
  - FormData: `file` (ảnh ≤10MB, image/*), optional `lang`.  
  - Trả về: `{ success, texts, raw }`

## 🧪 Quick tests
```bash
# STT
curl -X POST http://localhost:3000/api/naver/stt \
  -F file=@sample.wav \
  -F lang=Eng | jq .

# OCR
curl -X POST http://localhost:3000/api/naver/ocr \
  -F file=@sample.jpg \
  -F lang=ko | jq .
```

## 📦 Client usage example (Next.js)
```ts
async function runStt(file: File) {
  const body = new FormData();
  body.append('file', file);
  body.append('lang', 'Eng');

  const res = await fetch('/api/naver/stt', { method: 'POST', body });
  return res.json();
}

async function runOcr(file: File) {
  const body = new FormData();
  body.append('file', file);
  body.append('lang', 'ko');

  const res = await fetch('/api/naver/ocr', { method: 'POST', body });
  return res.json();
}
```
