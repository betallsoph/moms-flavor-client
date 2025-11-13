# 🤖 NAVER AiTEMS - MASTER GUIDE

> **Complete guide for integrating AI-powered recipe recommendations into Mom's Flavor app**

---

## 📋 TABLE OF CONTENTS

1. [Quick Start (5 min)](#quick-start)
2. [Status & Overview](#status-overview)
3. [Phase 1: Service + API Keys (15 min)](#phase-1)
4. [Phase 2: Schemas (15 min)](#phase-2)
5. [Phase 3: Datasets (15 min)](#phase-3)
6. [Phase 4: Train Model (5-30 min)](#phase-4)
7. [Phase 5: Test & Integrate (15 min)](#phase-5)
8. [Environment Configuration](#environment-config)
9. [Troubleshooting](#troubleshooting)
10. [Monitoring & Maintenance](#monitoring)
11. [Quick Reference Cheat Sheet](#cheat-sheet)

---

<a name="quick-start"></a>
## ⚡ QUICK START

**Total Time:** 1-2 giờ  
**Prerequisites:** Code đã sẵn sàng 100% ✅

### **5 Phases Overview:**

```
Phase 1: Create Service + Get API Keys     → 15 phút
Phase 2: Create 3 Schemas                  → 15 phút  
Phase 3: Create 3 Datasets                 → 15 phút
Phase 4: Train Model                       → 5-30 phút (auto)
Phase 5: Test & Integrate                  → 15 phút
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~1-2 giờ
```

### **Start Now:**

```bash
# 1. Open this guide
open AITEMS_MASTER_GUIDE.md

# 2. Open Naver Console
open https://console.ncloud.com

# 3. Follow Phase 1-5 below!
```

---

<a name="status-overview"></a>
## 📊 STATUS & OVERVIEW

### **✅ COMPLETED (Your App):**

```
✅ Auto-sync Service
   → libs/aitemsSync.ts
   → Tự động sync cooking data lên Object Storage

✅ Data Structure  
   → AiTEMS-input/cook-history/
      ├── interactions/  (cooking events)
      ├── items/         (recipes)
      └── users/         (user stats)

✅ API Route
   → /api/recommendations
   → Calls AiTEMS, returns recommendations

✅ UI Page
   → /recommendations
   → Beautiful AI recommendation cards

✅ Home Integration
   → "Gợi ý từ AI" button on home page
```

### **⏳ TODO (Naver Console):**

```
⏳ Phase 1: Create AiTEMS service
⏳ Phase 2: Define data schemas
⏳ Phase 3: Link datasets to Object Storage
⏳ Phase 4: Train AI model
⏳ Phase 5: Test & verify
```

### **How It Works:**

```
User nấu món xong
    ↓
Save reflection (rating, notes, images)
    ↓
[AUTO] syncCookingEvent()
    ↓
Upload JSON to: AiTEMS-input/cook-history/
    ↓
AiTEMS reads data → Learns patterns
    ↓
GET /api/recommendations
    ↓
AI returns personalized suggestions! 🎯
```

---

<a name="phase-1"></a>
## 🚀 PHASE 1: CREATE SERVICE + GET API KEYS

**Time:** 15 minutes  
**Goal:** Create AiTEMS service and get API credentials

### **Step 1.1: Access Naver Cloud Console**

1. **Open browser:** https://console.ncloud.com
2. **Login** with your Naver account
3. **Select region:** Korea (if prompted)

### **Step 1.2: Find AiTEMS Service**

**Method 1: Via Menu**
```
Console Home
→ Click "Services" (left menu)
→ Scroll to "AI/Application Services"
→ Click "AiTEMS"
```

**Method 2: Via Search**
```
Console Home
→ Search bar (top) → Type "AiTEMS"
→ Click result
```

**⚠️ If AiTEMS not visible:**
- Service might not be available yet
- Try: Console → Products → AI Services → AiTEMS
- Or contact Naver support to enable

### **Step 1.3: Enable AiTEMS (if not active)**

```
AiTEMS Page
→ Click "이용 신청" (Apply for Use) or "Subscribe"
→ Select region: Korea
→ Accept terms
→ Click "신청" (Apply)
→ Wait 1-2 minutes
```

### **Step 1.4: Create New Service**

```
AiTEMS Console
→ Click "서비스 생성" (Create Service) or "+ Create Service"
```

**Fill form:**

| Field | Value | Notes |
|-------|-------|-------|
| **Service Name** | `moms-flavor-recommendations` | Any name you want |
| **Description** | `AI recipe recommendations based on cooking history` | Optional |
| **Region** | `Korea (kr-standard)` | MUST match Object Storage region |
| **Service Type** | `Recommendation` or `추천` | Select recommendation type |

```
→ Click "생성" (Create) or "Create"
→ Wait for provisioning (~1-2 minutes)
→ Status: "Active" ✅
```

**📝 SAVE THIS:**
```
Service ID: srv-xxxxxxxxx
```

### **Step 1.5: Generate API Keys**

```
AiTEMS Console
→ Click on your newly created service
→ Tab "API 키" (API Keys) or "Credentials"
→ Click "API 키 생성" (Generate API Key)
```

**⚠️ CRITICAL - COPY IMMEDIATELY:**
```
✅ API Gateway URL: https://aitems.apigw.ntruss.com
✅ Service ID: srv-xxxxxxxxx
✅ API Key ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
✅ API Key Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ API Key Secret shows ONLY ONCE! Copy now!**

### **Step 1.6: Add to .env.local**

Open `.env.local` file and add:

```bash
# ============ NAVER AITEMS ============
NAVER_AITEMS_API_URL=https://aitems.apigw.ntruss.com
NAVER_AITEMS_SERVICE_ID=srv-xxxxxxxxx
NAVER_AITEMS_API_KEY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NAVER_AITEMS_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Save file and restart server:**
```bash
pkill -f "next dev"
npm run dev
```

✅ **Phase 1 Complete!** Service created + Keys saved

---

<a name="phase-2"></a>
## 🗂️ PHASE 2: CREATE SCHEMAS

**Time:** 15 minutes  
**Goal:** Define 3 data schemas (Interaction, Item, User)

AiTEMS needs to understand your data structure. You'll create 3 schemas.

### **Step 2.1: Navigate to Schemas**

```
AiTEMS Console
→ Click on service "moms-flavor-recommendations"
→ Tab "스키마" (Schemas)
→ Click "스키마 생성" (Create Schema)
```

### **Step 2.2: Create INTERACTION Schema ⭐**

**Most Important Schema!**

| Field | Value |
|-------|-------|
| **Schema Type** | `INTERACTION` or `상호작용` |
| **Schema Name** | `CookingEvents` |
| **Description** | `User cooking history and ratings` |

**Define Fields:** (Click "필드 추가" / "Add Field" for each)

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `USER_ID` | `STRING` | ✅ Yes | Firebase user ID |
| `ITEM_ID` | `STRING` | ✅ Yes | Recipe ID |
| `TIMESTAMP` | `LONG` | ✅ Yes | Unix timestamp (milliseconds) |
| `EVENT_TYPE` | `STRING` | ❌ No | "complete", "rate" |
| `RATING` | `INTEGER` | ❌ No | 1-5 stars |
| `HAS_NOTES` | `BOOLEAN` | ❌ No | Has cooking notes? |
| `HAS_IMAGES` | `BOOLEAN` | ❌ No | Has uploaded images? |
| `COOK_DATE` | `STRING` | ❌ No | Human-readable date |

**How to add field:**
```
1. Click "필드 추가" (Add Field)
2. Field Name: USER_ID
3. Type: Dropdown → Select "STRING"
4. Required: Check ✅
5. Click "추가" (Add)
6. Repeat for all 8 fields
```

```
→ Click "생성" (Create)
→ Schema created: ✅ CookingEvents
```

### **Step 2.3: Create ITEM Schema**

```
Tab "스키마" (Schemas)
→ Click "스키마 생성" (Create Schema)
```

| Field | Value |
|-------|-------|
| **Schema Type** | `ITEM` or `아이템` |
| **Schema Name** | `Recipes` |
| **Description** | `Recipe information and metadata` |

**Define Fields:**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `ITEM_ID` | `STRING` | ✅ Yes | Recipe ID (primary key) |
| `ITEM_NAME` | `STRING` | ✅ Yes | Recipe/dish name |
| `CATEGORY` | `STRING` | ❌ No | Difficulty level |
| `DESCRIPTION` | `STRING` | ❌ No | Recipe description |
| `COOKING_TIME` | `STRING` | ❌ No | Time category |
| `TAGS` | `ARRAY` | ❌ No | Ingredients, brands |
| `IMAGE_URL` | `STRING` | ❌ No | Cover image URL |
| `CREATED_AT` | `LONG` | ❌ No | Creation timestamp |

**⚠️ For TAGS field:**
- Type: Select `ARRAY` or `배열`
- Array Element Type: `STRING`

```
→ Click "생성" (Create)
→ Schema created: ✅ Recipes
```

### **Step 2.4: Create USER Schema**

```
Tab "스키마" (Schemas)
→ Click "스키마 생성" (Create Schema)
```

| Field | Value |
|-------|-------|
| **Schema Type** | `USER` or `사용자` |
| **Schema Name** | `CookingUsers` |
| **Description** | `User cooking preferences and statistics` |

**Define Fields:**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `USER_ID` | `STRING` | ✅ Yes | Firebase user ID (primary key) |
| `TOTAL_COOKS` | `INTEGER` | ❌ No | Total cooking sessions |
| `FAVORITE_CATEGORIES` | `ARRAY` | ❌ No | Preferred difficulty levels |
| `LAST_ACTIVE` | `LONG` | ❌ No | Last activity timestamp |

```
→ Click "생성" (Create)
→ Schema created: ✅ CookingUsers
```

✅ **Phase 2 Complete!** Verify: Tab "스키마" shows 3 schemas

---

<a name="phase-3"></a>
## 🔗 PHASE 3: CREATE DATASETS & LINK OBJECT STORAGE

**Time:** 15 minutes  
**Goal:** Link 3 schemas with data in Object Storage

### **Step 3.1: Navigate to Datasets**

```
AiTEMS Console
→ Service "moms-flavor-recommendations"
→ Tab "데이터셋" (Datasets)
→ Click "데이터셋 생성" (Create Dataset)
```

### **Step 3.2: Create INTERACTION Dataset**

| Field | Value |
|-------|-------|
| **Dataset Name** | `cooking-interactions` |
| **Dataset Type** | `INTERACTION` |
| **Schema** | `CookingEvents` |

**Data Source Configuration:**

| Field | Value | Notes |
|-------|-------|-------|
| **Source Type** | `Object Storage` or `객체 스토리지` | |
| **Bucket** | `moms-flavor-media` | Your bucket name |
| **Path** | `AiTEMS-input/cook-history/interactions/` | ⚠️ NEW PATH! |
| **Format** | `JSON` | |
| **Encoding** | `UTF-8` | Default |

**⚠️ Path Format Rules:**
- NO leading slash: `AiTEMS-input/...` ✅ NOT `/AiTEMS-input/...` ❌
- MUST end with slash: `interactions/` ✅
- Case-sensitive

```
→ Click "연결 테스트" (Test Connection) to verify
→ Should see: "연결 성공" (Connection Success) ✅
→ Click "생성" (Create)
→ Dataset created: ✅ cooking-interactions
```

### **Step 3.3: Create ITEM Dataset**

```
Tab "데이터셋" (Datasets)
→ Click "데이터셋 생성" (Create Dataset)
```

| Field | Value |
|-------|-------|
| **Dataset Name** | `recipes-items` |
| **Dataset Type** | `ITEM` |
| **Schema** | `Recipes` |
| **Bucket** | `moms-flavor-media` |
| **Path** | `AiTEMS-input/cook-history/items/` |
| **Format** | `JSON` |

```
→ Test Connection ✅
→ Create
→ Dataset created: ✅ recipes-items
```

### **Step 3.4: Create USER Dataset**

```
Tab "데이터셋" (Datasets)
→ Click "데이터셋 생성" (Create Dataset)
```

| Field | Value |
|-------|-------|
| **Dataset Name** | `cooking-users` |
| **Dataset Type** | `USER` |
| **Schema** | `CookingUsers` |
| **Bucket** | `moms-flavor-media` |
| **Path** | `AiTEMS-input/cook-history/users/` |
| **Format** | `JSON` |

```
→ Test Connection ✅
→ Create
→ Dataset created: ✅ cooking-users
```

✅ **Phase 3 Complete!** Verify: Tab "데이터셋" shows 3 active datasets

---

<a name="phase-4"></a>
## 🤖 PHASE 4: TRAIN AI MODEL

**Time:** 5-30 minutes (automatic)  
**Goal:** Train recommendation model with your data

### **Step 4.1: Configure Training Settings**

```
AiTEMS Console
→ Service "moms-flavor-recommendations"
→ Tab "학습" (Training) or "Model"
→ Click "학습 설정" (Training Configuration)
```

**Algorithm Selection:**

| Setting | Recommended Value | Why |
|---------|-------------------|-----|
| **Algorithm** | `Hybrid` (Collaborative + Content-Based) | Best for recipes |
| **Collaborative Filtering** | Enable ✅ | Based on similar users |
| **Content-Based** | Enable ✅ | Based on recipe attributes |

**Parameters:**

| Setting | Value | Notes |
|---------|-------|-------|
| **Min Interactions** | `10` | Minimum data needed |
| **Recommendation Count** | `10-20` | Number to return |
| **Confidence Threshold** | `0.5` | Min score (0-1) |
| **Cold Start Strategy** | `Popular Items` | For new users |

```
→ Click "저장" (Save)
```

### **Step 4.2: Start Training**

```
Tab "학습" (Training)
→ Click "학습 시작" (Start Training)
```

**Select Datasets:** (Check all 3)
- ✅ cooking-interactions
- ✅ recipes-items
- ✅ cooking-users

**Training Options:**

| Setting | Value |
|---------|-------|
| **Training Type** | `Full Training` (first time) |
| **Auto-deploy** | Enable ✅ (auto-deploy after training) |

```
→ Click "학습 시작" (Start Training)
→ Confirm → Click "확인" (OK)
```

### **Step 4.3: Monitor Training Progress**

**Status progression:**
```
학습 중 (Training...) → 평가 중 (Evaluating...) → 완료 (Completed)
```

**Expected Metrics:**

| Metric | Good Range | Meaning |
|--------|------------|---------|
| **Precision** | 0.6 - 0.9 | Accuracy of recommendations |
| **Recall** | 0.5 - 0.8 | Coverage of relevant items |
| **NDCG** | 0.6 - 0.9 | Ranking quality |
| **Coverage** | 50% - 80% | % of items recommended |

**⏱️ Training Duration:**
- Small data (<100 interactions): 5-10 minutes
- Medium data (100-1000): 10-20 minutes
- Large data (>1000): 20-30 minutes

### **Step 4.4: Deploy Model**

**If Auto-deploy enabled:** Model deploys automatically

**If Manual deploy:**
```
Tab "학습" (Training)
→ See completed training
→ Click "배포" (Deploy)
→ Confirm deployment
→ Wait ~2-5 minutes
→ Status: "서비스 중" (Active) ✅
```

✅ **Phase 4 Complete!** Model trained & deployed

---

<a name="phase-5"></a>
## 🧪 PHASE 5: TEST & INTEGRATE

**Time:** 15 minutes  
**Goal:** Test API and verify integration

### **Step 5.1: Test with CURL**

**Test Naver AiTEMS API directly:**

```bash
curl -X GET \
  "https://aitems.apigw.ntruss.com/v1/services/YOUR_SERVICE_ID/recommend?userId=test-user-456&count=5" \
  -H "x-ncp-apigw-api-key-id: YOUR_API_KEY_ID" \
  -H "x-ncp-apigw-api-key: YOUR_API_KEY_SECRET"
```

**Replace:**
- `YOUR_SERVICE_ID` → From `.env.local`
- `YOUR_API_KEY_ID` → From `.env.local`
- `YOUR_API_KEY_SECRET` → From `.env.local`

**✅ Expected Response:**
```json
{
  "requestId": "xxx",
  "recommendations": [
    {
      "itemId": "recipe-bun-cha",
      "score": 0.87
    }
  ]
}
```

### **Step 5.2: Test App API Route**

**Verify environment variables:**
```bash
cat .env.local | grep AITEMS
```

Should show all 4 variables:
```
NAVER_AITEMS_API_URL=...
NAVER_AITEMS_SERVICE_ID=...
NAVER_AITEMS_API_KEY_ID=...
NAVER_AITEMS_API_KEY_SECRET=...
```

**Restart server:**
```bash
pkill -f "next dev"
npm run dev
```

**Test API:**
```bash
curl "http://localhost:3002/api/recommendations?userId=test-user-456&count=5&fallback=true"
```

**✅ Expected Response:**
```json
{
  "success": true,
  "source": "aitems",
  "count": 5,
  "recommendations": [
    {
      "id": "recipe-xxx",
      "dishName": "Bún Chả",
      "recommendationScore": 0.87,
      ...
    }
  ]
}
```

### **Step 5.3: Test UI Page**

**Open browser:**
```
http://localhost:3002/recommendations
```

**✅ Should see:**
- Loading spinner
- "✨ Được chọn bởi AI..." subtitle
- Grid of recommendation cards
- Rank badges (#1, #2, etc.)
- Recipe images
- Match scores
- "Xem chi tiết" buttons

**Test interaction:**
- Click a recipe card → Should navigate to recipe detail

### **Step 5.4: Test End-to-End Flow**

1. **Cook a recipe:**
   ```
   /recipes → Pick recipe
   → "Nấu món này"
   → Check ingredients
   → Cook through steps
   → Complete reflection (rate, add notes)
   → Save
   ```

2. **Check browser console:**
   ```
   🤖 [AiTEMS] Syncing cooking event...
   🔄 Uploading JSON to Naver: AiTEMS-input/cook-history/...
   ✅ [AiTEMS] Sync complete!
   ```

3. **Verify Object Storage:**
   ```
   Naver Console → Object Storage → moms-flavor-media
   → AiTEMS-input/cook-history/
   → Should see new JSON files
   ```

4. **Wait 1-2 minutes** (for AiTEMS to ingest)

5. **Refresh recommendations:**
   ```
   /recommendations → Click "🔄 Làm mới gợi ý"
   → Recommendations should update
   ```

✅ **Phase 5 Complete!** All tests passing!

---

<a name="environment-config"></a>
## 🔧 ENVIRONMENT CONFIGURATION

### **Required Environment Variables**

Add these to `.env.local`:

```bash
# ============ NAVER AITEMS ============

# API Gateway URL (usually this default)
NAVER_AITEMS_API_URL=https://aitems.apigw.ntruss.com

# Service ID (from AiTEMS Console > Your Service)
NAVER_AITEMS_SERVICE_ID=srv-xxxxxxxxx

# API Key ID (from AiTEMS Console > API Keys)
NAVER_AITEMS_API_KEY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# API Key Secret (from AiTEMS Console > API Keys)
NAVER_AITEMS_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **How to Get Credentials**

**Service ID:**
```
Naver Console → AiTEMS → Services → [Your Service]
→ Copy "Service ID" from service details
```

**API Keys:**
```
Naver Console → AiTEMS → Services → [Your Service] → API Keys
→ Click "Generate API Key"
→ Copy:
   - API Key ID
   - API Key Secret (only shows once!)
```

### **Verify Configuration**

```bash
# Check variables are set
cat .env.local | grep AITEMS

# Test connection
curl "http://localhost:3002/api/recommendations?userId=test&fallback=true"
```

### **Production Deployment**

**Vercel:**
```
Project Settings → Environment Variables
→ Add all NAVER_AITEMS_* variables
```

**Railway / Heroku:**
```bash
railway variables set NAVER_AITEMS_SERVICE_ID=xxx
railway variables set NAVER_AITEMS_API_KEY_ID=xxx
railway variables set NAVER_AITEMS_API_KEY_SECRET=xxx
```

### **Security Notes**

⚠️ **Important:**
- NEVER commit `.env.local` to git
- API Keys have full service access - keep secret
- Rotate keys every 3-6 months
- Use environment variables in production

---

<a name="troubleshooting"></a>
## 🐛 TROUBLESHOOTING

### **Issue: Schema creation failed**

**Symptom:** Error when creating schema

**Causes & Fixes:**
- **Field type mismatch:**
  - TIMESTAMP must be `LONG` (not INTEGER)
  - TAGS must be `ARRAY` with element type `STRING`
- **Duplicate field names:** Ensure all field names are unique
- **Reserved keywords:** Avoid SQL reserved words

---

### **Issue: Dataset connection failed**

**Symptom:** "연결 실패" or "Connection failed"

**Causes & Fixes:**

**Wrong path format:**
```bash
✅ CORRECT: AiTEMS-input/cook-history/interactions/
❌ WRONG: /AiTEMS-input/cook-history/interactions/  (leading /)
❌ WRONG: AiTEMS-input/cook-history/interactions   (no trailing /)
```

**Bucket permissions:**
```
Object Storage → Bucket → Permissions
→ Enable "Public Read" for AiTEMS access
```

**Empty folders:**
```
# Generate test data:
curl http://localhost:3002/api/test-aitems
```

---

### **Issue: Training failed - insufficient data**

**Symptom:** Training fails with "not enough data"

**Fixes:**

```bash
# Generate test data (run 10 times):
for i in {1..10}; do
  curl http://localhost:3002/api/test-aitems
  sleep 1
done

# Verify data in Object Storage
# Then retry training
```

**Minimum requirements:**
- 50-100 interaction records
- 10+ unique users
- 10+ unique items

---

### **Issue: API authentication failed**

**Symptom:** `{"error": "AUTHENTICATION_FAILED"}`

**Fixes:**

```bash
# 1. Verify .env.local:
cat .env.local | grep AITEMS

# 2. Check for issues:
# - Extra spaces
# - Quotes around values (shouldn't have)
# - Correct keys from Console

# 3. Restart server:
pkill -f "next dev"
npm run dev

# 4. Test again
```

---

### **Issue: No recommendations returned**

**Symptom:** Empty recommendations array or 0 results

**Fixes:**

**Check model status:**
```
AiTEMS Console → Service → Model status should be "Active"
```

**Check datasets:**
```
Console → Datasets → Should show data count > 0
```

**Try with test user:**
```bash
curl "http://localhost:3002/api/recommendations?userId=test-user-456&fallback=true"
```

**Use fallback mode:**
- `?fallback=true` returns popular items if AI fails
- Useful for testing

---

### **Issue: Recommendations not updating**

**Symptom:** Same recommendations after cooking new recipes

**Causes & Fixes:**

**Data not synced:**
```
# Check console logs after cooking:
🤖 [AiTEMS] Syncing... ← Should see this
✅ [AiTEMS] Sync complete! ← Should see this

# If not, check:
- .env.local has storage credentials
- Firestore save successful
```

**AiTEMS hasn't ingested:**
```
# Wait 1-2 minutes after sync
# AiTEMS batch processes data every few minutes
```

**Model needs retraining:**
```
# Retrain with new data:
AiTEMS Console → Training → Start Training
```

---

<a name="monitoring"></a>
## 📊 MONITORING & MAINTENANCE

### **Daily Checks**

**1. Check sync status:**
```bash
# After users cook, verify Object Storage:
Naver Console → Object Storage → AiTEMS-input/cook-history/
→ Files updated recently? ✅
```

**2. Check API health:**
```bash
curl http://localhost:3002/api/recommendations?userId=xxx
→ Status 200? ✅
→ Response time < 500ms? ✅
```

**3. Check model metrics:**
```
AiTEMS Console → Service → Tab "모니터링" (Monitoring)
→ Request count (increasing?)
→ Response time (<500ms?)
→ Error rate (<5%?)
```

### **Weekly Maintenance**

**1. Retrain model:**
```
More data = better recommendations

AiTEMS Console → Training → Start Training
→ Weekly retraining recommended with new data
```

**2. Review metrics:**
```
Check if Precision/Recall improving over time
Adjust algorithm parameters if needed
```

**3. Clean old data (optional):**
```
Object Storage → Review old test data
Keep last 3-6 months of real data
Delete ancient test files
```

### **Performance Metrics**

**Good Targets:**

| Metric | Target | Action if Below |
|--------|--------|-----------------|
| Precision | > 0.6 | Adjust confidence threshold |
| Recall | > 0.5 | Add more training data |
| API Response Time | < 500ms | Check Naver region/network |
| Error Rate | < 5% | Check API logs |
| Coverage | > 50% | Expand item catalog |

---

<a name="cheat-sheet"></a>
## 📋 QUICK REFERENCE CHEAT SHEET

### **5 Phases at a Glance**

```
Phase 1: Service + Keys (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Console → AiTEMS → Create Service
□ Generate API Keys
□ Add to .env.local
□ Restart server

Phase 2: Schemas (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Create INTERACTION schema (8 fields)
□ Create ITEM schema (8 fields)
□ Create USER schema (4 fields)

Phase 3: Datasets (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Link interactions → AiTEMS-input/cook-history/interactions/
□ Link items → AiTEMS-input/cook-history/items/
□ Link users → AiTEMS-input/cook-history/users/
□ Test connections ✅

Phase 4: Train (5-30 min auto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Configure: Hybrid algorithm
□ Select all 3 datasets
□ Start training
□ Wait for completion
□ Auto-deploy ✅

Phase 5: Test (15 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Test CURL → AiTEMS API
□ Test App API → /api/recommendations
□ Test UI → /recommendations
□ Test E2E → Cook → Sync → Update
```

### **Schema Quick Copy**

**INTERACTION Schema:**
```
Type: INTERACTION, Name: CookingEvents

USER_ID       STRING    Required
ITEM_ID       STRING    Required
TIMESTAMP     LONG      Required
EVENT_TYPE    STRING    Optional
RATING        INTEGER   Optional
HAS_NOTES     BOOLEAN   Optional
HAS_IMAGES    BOOLEAN   Optional
COOK_DATE     STRING    Optional
```

**ITEM Schema:**
```
Type: ITEM, Name: Recipes

ITEM_ID       STRING    Required
ITEM_NAME     STRING    Required
CATEGORY      STRING    Optional
DESCRIPTION   STRING    Optional
COOKING_TIME  STRING    Optional
TAGS          ARRAY     Optional (of STRING)
IMAGE_URL     STRING    Optional
CREATED_AT    LONG      Optional
```

**USER Schema:**
```
Type: USER, Name: CookingUsers

USER_ID               STRING    Required
TOTAL_COOKS           INTEGER   Optional
FAVORITE_CATEGORIES   ARRAY     Optional (of STRING)
LAST_ACTIVE           LONG      Optional
```

### **Dataset Configuration**

```yaml
Interactions Dataset:
  Name: cooking-interactions
  Type: INTERACTION
  Schema: CookingEvents
  Path: AiTEMS-input/cook-history/interactions/

Items Dataset:
  Name: recipes-items
  Type: ITEM
  Schema: Recipes
  Path: AiTEMS-input/cook-history/items/

Users Dataset:
  Name: cooking-users
  Type: USER
  Schema: CookingUsers
  Path: AiTEMS-input/cook-history/users/
```

### **Common Commands**

```bash
# Generate test data
curl http://localhost:3002/api/test-aitems

# Test recommendations
curl "http://localhost:3002/api/recommendations?userId=test-user-456&fallback=true"

# Check env vars
cat .env.local | grep AITEMS

# Restart server
pkill -f "next dev" && npm run dev

# Test UI
open http://localhost:3002/recommendations
```

### **Important Paths**

```
Object Storage Structure:
AiTEMS-input/cook-history/
├── interactions/  ← Cooking events
├── items/         ← Recipe data
└── users/         ← User stats

Code Files:
libs/aitemsSync.ts           ← Auto-sync service
libs/naverStorage.ts         ← Upload functions
app/api/recommendations/     ← API route
app/recommendations/         ← UI page
```

---

## ✅ FINAL CHECKLIST

**Before finishing, verify:**

- [ ] ✅ Service created & Active in Naver Console
- [ ] ✅ 3 schemas created (Interaction, Item, User)
- [ ] ✅ 3 datasets linked & connection tested
- [ ] ✅ Model trained & deployed (Status: Active)
- [ ] ✅ Direct API tested with CURL → Works
- [ ] ✅ App API tested → Returns recommendations
- [ ] ✅ UI page works → Beautiful cards displayed
- [ ] ✅ E2E flow tested → Sync works after cooking
- [ ] ✅ `.env.local` has all 4 AiTEMS variables
- [ ] ✅ Server restarted with new env vars
- [ ] ✅ No errors in console logs
- [ ] ✅ Ready for production!

---

## 🎉 CONGRATULATIONS!

**Your app now has AI-powered recipe recommendations!** 🤖✨

```
User cooking behavior
    ↓
Machine Learning
    ↓
Personalized suggestions
    ↓
Better cooking experience!
```

---

## 📚 ADDITIONAL RESOURCES

**Documentation:**
- Naver AiTEMS Docs: https://api.ncloud-docs.com/docs/en/ai-application-service-aitems
- Naver Console: https://console.ncloud.com

**Support:**
- Naver Cloud Support: https://www.ncloud.com/support

**Your App:**
- Recommendations UI: http://localhost:3002/recommendations
- API Endpoint: http://localhost:3002/api/recommendations
- Test API: http://localhost:3002/api/test-aitems

---

**🚀 Enjoy your intelligent cooking assistant!**

