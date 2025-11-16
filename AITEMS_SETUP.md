# 🤖 Naver AiTEMS Integration Guide

## Tổng quan

**AiTEMS** (AI Recommendation System) của Naver Cloud Platform giúp tạo AI recommendations dựa trên behavior data của users. App này đã được tích hợp **auto-sync** để tự động lưu cooking history lên Object Storage cho AiTEMS.

---

## 🎯 Cách hoạt động

```
User nấu xong món
    ↓
Lưu vào Firestore (cooking diary)
    ↓
[TỰ ĐỘNG] Sync lên Object Storage (cook-history/)
    ↓
AiTEMS đọc data
    ↓
Tạo AI recommendations: "Món bạn có thể thích", "Món phù hợp với skill level"
```

---

## 📂 Data Structure trong Object Storage

```
moms-flavor-media/cook-history/
│
├── interactions/           # User cooking events (QUAN TRỌNG NHẤT)
│   ├── interaction-{userId}-{timestamp}.json
│   └── interaction-{userId}-{timestamp}.json
│
├── items/                  # Recipe/dish information
│   ├── item-{recipeId}-{timestamp}.json
│   └── item-{recipeId}-{timestamp}.json
│
└── users/                  # User stats & preferences
    ├── user-{userId}-{timestamp}.json
    └── user-{userId}-{timestamp}.json
```

---

## 📊 Data Schemas

### 1. INTERACTION (Cooking Events)

**File**: `interactions/interaction-{userId}-{timestamp}.json`

```json
{
  "USER_ID": "firebase-user-id-123",
  "ITEM_ID": "recipe-id-456",
  "EVENT_TYPE": "complete",
  "TIMESTAMP": 1699632000000,
  "RATING": 5,
  "HAS_NOTES": true,
  "HAS_IMAGES": true,
  "COOK_DATE": "10/11/2025"
}
```

**Fields**:
- `USER_ID`: Firebase user ID
- `ITEM_ID`: Recipe ID
- `EVENT_TYPE`: Loại event (`complete`, `rate`)
- `TIMESTAMP`: Unix timestamp (milliseconds)
- `RATING`: Rating từ 1-5 stars (optional)
- `HAS_NOTES`: User có ghi chú không
- `HAS_IMAGES`: User có chụp ảnh không
- `COOK_DATE`: Ngày nấu (human-readable)

### 2. ITEM (Recipes)

**File**: `items/item-{recipeId}-{timestamp}.json`

```json
{
  "ITEM_ID": "recipe-id-456",
  "ITEM_NAME": "Phở Bò",
  "CATEGORY": "medium",
  "DESCRIPTION": "Traditional Vietnamese beef noodle soup",
  "COOKING_TIME": "slow",
  "TAGS": ["beef", "rice noodles", "star anise", "cinnamon"],
  "IMAGE_URL": "https://kr.object.ncloudstorage.com/...",
  "CREATED_AT": 1699000000000
}
```

**Fields**:
- `ITEM_ID`: Recipe ID
- `ITEM_NAME`: Tên món ăn
- `CATEGORY`: Độ khó (`very_easy`, `easy`, `medium`, `hard`, `very_hard`)
- `DESCRIPTION`: Mô tả món ăn
- `COOKING_TIME`: Thời gian nấu (`very_fast`, `fast`, `medium`, `slow`, `very_slow`)
- `TAGS`: Array của ingredients và brands
- `IMAGE_URL`: Cover image URL
- `CREATED_AT`: Unix timestamp khi recipe được tạo

### 3. USER (User Stats)

**File**: `users/user-{userId}-{timestamp}.json`

```json
{
  "USER_ID": "firebase-user-id-123",
  "TOTAL_COOKS": 25,
  "FAVORITE_CATEGORIES": ["easy", "medium"],
  "LAST_ACTIVE": 1699632000000
}
```

**Fields**:
- `USER_ID`: Firebase user ID
- `TOTAL_COOKS`: Tổng số lần nấu
- `FAVORITE_CATEGORIES`: Độ khó thường nấu nhất
- `LAST_ACTIVE`: Lần active cuối (Unix timestamp)

---

## 🔧 Implementation

### Auto-sync đã được implement

**File**: `/libs/aitemsSync.ts`

Khi user hoàn thành nấu ăn và save reflection, hệ thống sẽ:

1. ✅ Lưu diary entry vào Firestore
2. ✅ Tự động trigger `syncCookingEvent()`
3. ✅ Upload JSON files lên `cook-history/` folder
4. ✅ Silent fail nếu có lỗi (không ảnh hưởng UX)

**Code location**: `/app/cook/[id]/reflection/page.tsx` (line ~137)

```typescript
// 🤖 Auto-sync to AiTEMS (background task)
syncCookingEvent(diaryEntry, recipe, rating).catch(err => {
  console.warn('⚠️ AiTEMS sync failed (non-critical):', err);
});
```

---

## 📋 Bước tiếp theo: Setup AiTEMS trên Naver Cloud

### 1. Truy cập Naver Cloud Console

- Đăng nhập: https://console.ncloud.com
- Vào **AI Services** → **AiTEMS**

### 2. Create AiTEMS Service

```bash
# Sử dụng Naver Cloud API hoặc Console UI
```

### 3. Create Schemas

**a) INTERACTION Schema**

```bash
POST /schemas
{
  "datasetType": "interaction",
  "name": "CookingEvents",
  "fields": [
    { "name": "USER_ID", "type": ["string"] },
    { "name": "ITEM_ID", "type": ["string"] },
    { "name": "EVENT_TYPE", "type": ["string"] },
    { "name": "TIMESTAMP", "type": ["long"] },
    { "name": "RATING", "type": ["int"] },
    { "name": "HAS_NOTES", "type": ["boolean"] },
    { "name": "HAS_IMAGES", "type": ["boolean"] },
    { "name": "COOK_DATE", "type": ["string"] }
  ]
}
```

**b) ITEM Schema**

```bash
POST /schemas
{
  "datasetType": "item",
  "name": "Recipes",
  "fields": [
    { "name": "ITEM_ID", "type": ["string"] },
    { "name": "ITEM_NAME", "type": ["string"] },
    { "name": "CATEGORY", "type": ["string"] },
    { "name": "DESCRIPTION", "type": ["string"] },
    { "name": "COOKING_TIME", "type": ["string"] },
    { "name": "TAGS", "type": ["array"] },
    { "name": "IMAGE_URL", "type": ["string"] },
    { "name": "CREATED_AT", "type": ["long"] }
  ]
}
```

**c) USER Schema**

```bash
POST /schemas
{
  "datasetType": "user",
  "name": "CookingUsers",
  "fields": [
    { "name": "USER_ID", "type": ["string"] },
    { "name": "TOTAL_COOKS", "type": ["int"] },
    { "name": "FAVORITE_CATEGORIES", "type": ["array"] },
    { "name": "LAST_ACTIVE", "type": ["long"] }
  ]
}
```

### 4. Create Dataset

Link schemas với Object Storage path:

```bash
POST /datasets
{
  "schemaId": "interaction-schema-id",
  "dataLocation": "s3://moms-flavor-media/cook-history/interactions/"
}
```

Repeat cho `items` và `users`.

### 5. Train Model

```bash
POST /services/{serviceId}/train
{
  "datasets": ["interactions", "items", "users"]
}
```

### 6. Deploy và Get Recommendations

```bash
GET /services/{serviceId}/recommend
{
  "userId": "firebase-user-id-123",
  "count": 10
}
```

Response:
```json
{
  "recommendations": [
    { "itemId": "recipe-789", "score": 0.95 },
    { "itemId": "recipe-456", "score": 0.87 }
  ]
}
```

---

## 🚀 Next Steps - Frontend Integration

### 1. Create API Route

**File**: `/app/api/recommendations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  
  // Call AiTEMS API
  const response = await fetch(
    `https://aitems.apigw.ntruss.com/services/${serviceId}/recommend?userId=${userId}`,
    {
      headers: {
        'x-ncp-apigw-api-key': process.env.NAVER_AITEMS_API_KEY || '',
      }
    }
  );
  
  const data = await response.json();
  
  // Map recipe IDs to actual recipes
  const recipeIds = data.recommendations.map(r => r.itemId);
  // ... fetch recipes from Firestore
  
  return NextResponse.json({ recommendations: recipes });
}
```

### 2. Create Recommendations Page

**File**: `/app/recommendations/page.tsx`

```typescript
'use client';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    // Fetch recommendations from API
    fetch(`/api/recommendations?userId=${userId}`)
      .then(res => res.json())
      .then(data => setRecommendations(data.recommendations));
  }, []);
  
  return (
    <div>
      <h1>🤖 Gợi ý dành riêng cho bạn</h1>
      {recommendations.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

---

## 📊 Monitoring & Debugging

### Check if data is being synced

1. **Console logs**: Tìm `[AiTEMS]` trong browser console
   ```
   🔄 [AiTEMS] Syncing cooking event...
   ✅ [AiTEMS] Sync complete!
   ```

2. **Object Storage**: Kiểm tra files trong `cook-history/` folder
   ```bash
   # List files in Naver Object Storage
   aws s3 ls s3://moms-flavor-media/cook-history/ --endpoint-url https://kr.object.ncloudstorage.com
   ```

3. **Download sample file**:
   ```bash
   aws s3 cp s3://moms-flavor-media/cook-history/interactions/interaction-xxx-123.json . \
     --endpoint-url https://kr.object.ncloudstorage.com
   ```

### Common Issues

**❌ Upload failed: Access Denied**
- Check `NAVER_ACCESS_KEY` và `NAVER_SECRET_KEY` trong `.env.local`
- Verify bucket permissions cho `cook-history/` folder

**❌ AiTEMS not returning recommendations**
- Đảm bảo đã train model với enough data (minimum ~100 interactions)
- Check schema format matches data structure
- Verify dataset paths point to correct S3 locations

---

## 🎓 Best Practices

1. **Data Quality**: AiTEMS cần ít nhất 100-1000 interactions để recommendations tốt
2. **Regular Retraining**: Schedule weekly model retraining với new data
3. **A/B Testing**: Test recommendations quality, track CTR
4. **Privacy**: Ensure compliance với GDPR/privacy laws khi lưu user data
5. **Cost Optimization**: Consider batch uploads thay vì real-time cho mỗi event

---

## 📚 References

- [Naver Cloud AiTEMS Documentation](https://api.ncloud-docs.com/docs/en/ai-application-service-aitems)
- [Naver Cloud Console](https://console.ncloud.com)
- [Object Storage Guide](https://guide.ncloud-docs.com/docs/en/storage-storage-8-1)

---

## 💡 Tips

- **Start small**: Test với 1-2 users trước, verify data format
- **Use batch sync**: Implement daily aggregation (`batchSyncDaily()`) khi scale
- **Monitor costs**: AiTEMS charges dựa trên API calls và storage
- **Feedback loop**: Thu thập user feedback về recommendations để improve

---

**Setup done!** 🎉

Giờ mỗi lần user nấu xong món, data sẽ tự động sync lên Object Storage, sẵn sàng cho AiTEMS analyze và tạo recommendations!

