# 🤖 Naver AI (STT & OCR) Setup

Server-side wrappers cho Clova Speech-to-Text và Vision OCR.

## 🔑 Environment variables
Add vào `.env.local`:
```env
# API Gateway cho STT
NAVER_APIGW_KEY_ID=your_api_gateway_key_id
NAVER_APIGW_KEY=your_api_gateway_secret
NAVER_STT_ENDPOINT=https://naveropenapi.apigw.ntruss.com/recog/v1/stt # optional override

# OCR
NAVER_OCR_SECRET=your_ocr_secret
NAVER_OCR_ENDPOINT=https://naveropenapi.apigw.ntruss.com/vision-ocr/v1/general # optional override
```

## 🛠️ Server routes
- `POST /api/naver/stt`  
  - FormData: `file` (audio wav/mp3/pcm ≤15MB), optional `lang` (`Kor`, `Eng`, `Jpn`, `Chn`, `Th`, `Sp`).  
  - Trả về: `{ success, text, raw }`
- `POST /api/naver/ocr`  
  - FormData: `file` (ảnh ≤10MB, image/*), optional `lang` (`ko`, `en`, `ja`, `zh`, ...).  
  - Trả về: `{ success, texts, raw }`

## 🧪 Quick tests
```bash
# STT
curl -X POST http://localhost:3000/api/naver/stt \
  -F file=@sample.wav \
  -F lang=Kor | jq .

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
  body.append('lang', 'Kor');

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
