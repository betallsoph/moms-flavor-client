const admin = require('firebase-admin');
const path = require('path');

function requireServiceAccount() {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountPath) {
    const resolved = path.resolve(serviceAccountPath);
    // eslint-disable-next-line import/no-dynamic-require, global-require
    return require(resolved);
  }

  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson);
  }

  throw new Error(
    'Missing credentials. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON'
  );
}

function buildTimestamp(daysOffset, hours = 8) {
  const base = new Date(Date.UTC(2025, 0, 5, hours, 0, 0));
  base.setUTCDate(base.getUTCDate() + daysOffset);
  return base.toISOString();
}

function buildIngredients(slug, items) {
  return items.map((item, index) => ({
    id: `${slug}-ing-${index + 1}`,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
  }));
}

function buildSteps(slug, steps) {
  return JSON.stringify(
    steps.map((step, index) => ({
      id: `${slug}-step-${index + 1}`,
      step: index + 1,
      title: step.title,
      description: step.description,
    }))
  );
}

const serviceAccount = requireServiceAccount();

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const firestore = admin.firestore();

const userId = process.env.SEED_USER_ID;
if (!userId) {
  throw new Error('Missing SEED_USER_ID (Firebase auth UID to attach recipes to)');
}

const sampleRecipes = [
  {
    id: 'seed-canh-chua-ca-loc',
    dishName: 'Canh chua cá lóc',
    recipeName: 'Canh chua cá lóc chuẩn vị miền Tây',
    sameAsDish: false,
    difficulty: 'medium',
    cookingTime: 'medium',
    estimateTime: true,
    estimatedTime: '40 phút',
    instructor: 'Mẹ Hai',
    description:
      'Nồi canh chua thanh mát với vị me dịu, thơm mùi rau mùi tàu và giá đỗ, thích hợp cho bữa cơm gia đình ngày nắng.',
    ingredientsList: buildIngredients('seed-canh-chua-ca-loc', [
      { name: 'Cá lóc đồng', quantity: '1', unit: 'con (~900g)' },
      { name: 'Thơm chín', quantity: '1/2', unit: 'trái' },
      { name: 'Cà chua', quantity: '2', unit: 'trái' },
      { name: 'Bạc hà', quantity: '2', unit: 'cây' },
      { name: 'Giá đỗ', quantity: '200', unit: 'g' },
      { name: 'Me chín', quantity: '2', unit: 'muỗng canh' },
    ]),
    favoriteBrands: ['Nam Ngư', 'Cholimex'],
    specialNotes: 'Chần sơ cá với muối và gừng để khử mùi tanh trước khi nấu.',
    instructions: buildSteps('seed-canh-chua-ca-loc', [
      { title: 'Sơ chế cá', description: 'Cá lóc làm sạch, cắt khoanh và ướp muối, tiêu trong 10 phút.' },
      { title: 'Nấu nước dùng', description: 'Đun sôi 1.5 lít nước với me, thơm và cà chua cho ra vị chua ngọt.' },
      { title: 'Cho cá vào', description: 'Thả cá vào nồi, hạ lửa vừa và không khuấy mạnh để cá không nát.' },
      { title: 'Thêm rau', description: 'Cho bạc hà, giá đỗ và rau thơm vào, nêm nước mắm, đường và sa tế.' },
      { title: 'Hoàn thiện', description: 'Đun thêm 2 phút rồi tắt bếp, rắc ngò gai và ớt xiêm.' },
    ]),
    tips: 'Không đậy nắp sau khi cho rau để giữ màu xanh và độ giòn.',
    coverImage: '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_27_58 PM.png',
    galleryImages: [
      '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_27_58 PM.png',
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_42_01 PM.png',
    ],
    createdAt: buildTimestamp(0),
    updatedAt: buildTimestamp(2),
  },
  {
    id: 'seed-thit-kho-tau',
    dishName: 'Thịt kho tàu',
    recipeName: 'Thịt kho trứng nước dừa',
    sameAsDish: true,
    difficulty: 'medium',
    cookingTime: 'slow',
    estimateTime: false,
    estimatedTime: '90 phút',
    instructor: 'Ba Út',
    description: 'Món thịt kho mềm béo kết hợp nước dừa ngọt thanh và trứng vịt bùi béo, thích hợp cho ngày Tết.',
    ingredientsList: buildIngredients('seed-thit-kho-tau', [
      { name: 'Thịt ba rọi', quantity: '1', unit: 'kg' },
      { name: 'Trứng vịt', quantity: '6', unit: 'quả' },
      { name: 'Nước dừa tươi', quantity: '500', unit: 'ml' },
      { name: 'Đường thốt nốt', quantity: '3', unit: 'muỗng canh' },
      { name: 'Nước mắm ngon', quantity: '4', unit: 'muỗng canh' },
      { name: 'Hành tím', quantity: '4', unit: 'củ' },
    ]),
    favoriteBrands: ['Nam Ngư', 'Vedan'],
    specialNotes: 'Để thịt nghỉ qua đêm trong nồi để thấm vị hơn.',
    instructions: buildSteps('seed-thit-kho-tau', [
      { title: 'Ướp thịt', description: 'Cắt thịt khối 4cm, ướp với nước mắm, đường, hành tím và tiêu 30 phút.' },
      { title: 'Luộc trứng', description: 'Luộc trứng vịt 7 phút, lột vỏ và chiên sơ cho săn.' },
      { title: 'Thắng nước màu', description: 'Đun đường thốt nốt đến màu cánh gián rồi cho thịt vào đảo đều.' },
      { title: 'Kho với nước dừa', description: 'Đổ nước dừa, kho nhỏ lửa 60 phút đến khi thịt mềm.' },
      { title: 'Hoàn thiện', description: 'Cho trứng vào kho 10 phút, nêm lại và tắt bếp.' },
    ]),
    tips: 'Không khuấy quá mạnh sau khi cho trứng để giữ nguyên bề mặt đẹp.',
    coverImage: '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_34 PM.png',
    galleryImages: [
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_34 PM.png',
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 09_34_31 PM.png',
    ],
    createdAt: buildTimestamp(1),
    updatedAt: buildTimestamp(2, 16),
  },
  {
    id: 'seed-goi-cuon-tom-thit',
    dishName: 'Gỏi cuốn tôm thịt',
    recipeName: 'Gỏi cuốn tôm thịt nước chấm tương',
    sameAsDish: false,
    difficulty: 'easy',
    cookingTime: 'fast',
    estimateTime: true,
    estimatedTime: '25 phút',
    instructor: 'Dì Sáu',
    description: 'Món cuốn thanh nhẹ với rau sống, tôm luộc và thịt ba chỉ ăn kèm tương đậu phộng béo.',
    ingredientsList: buildIngredients('seed-goi-cuon-tom-thit', [
      { name: 'Bánh tráng mỏng', quantity: '15', unit: 'bánh' },
      { name: 'Tôm sú', quantity: '300', unit: 'g' },
      { name: 'Thịt ba chỉ', quantity: '250', unit: 'g' },
      { name: 'Bún tươi', quantity: '200', unit: 'g' },
      { name: 'Rau sống', quantity: '1', unit: 'rổ nhỏ' },
      { name: 'Đậu phộng rang', quantity: '50', unit: 'g' },
    ]),
    favoriteBrands: ['Lee Kum Kee', 'Cholimex'],
    specialNotes: 'Khi cuốn nhớ đặt rau thơm bên trên để cuốn nhìn đẹp mắt.',
    instructions: buildSteps('seed-goi-cuon-tom-thit', [
      { title: 'Luộc tôm thịt', description: 'Luộc tôm với ít gừng, cắt đôi; luộc thịt ba chỉ rồi thái mỏng.' },
      { title: 'Chuẩn bị rau', description: 'Rửa sạch xà lách, húng, giá và để ráo.' },
      { title: 'Làm nước chấm', description: 'Phi tỏi với dầu, cho tương hột, bơ đậu phộng, nước dừa và nêm đường.' },
      { title: 'Cuốn gỏi', description: 'Làm ẩm bánh tráng, xếp bún, rau, tôm thịt rồi cuộn chặt tay.' },
      { title: 'Trình bày', description: 'Xếp cuốn ra đĩa, rắc đậu phộng giã và ăn kèm nước chấm.' },
    ]),
    tips: 'Bánh tráng nên nhúng nhanh qua nước ấm để không bị rách.',
    coverImage: '/assets/sticker2/ChatGPT Image Nov 4, 2025, 09_34_35 PM.png',
    galleryImages: [
      '/assets/sticker2/ChatGPT Image Nov 4, 2025, 09_34_35 PM.png',
      '/assets/sticker2/tobboki.png',
    ],
    createdAt: buildTimestamp(2),
    updatedAt: buildTimestamp(3),
  },
  {
    id: 'seed-pho-bo-tai-nam',
    dishName: 'Phở bò tái nạm',
    recipeName: 'Phở bò tái nạm nước dùng trong',
    sameAsDish: true,
    difficulty: 'hard',
    cookingTime: 'very_slow',
    estimateTime: false,
    estimatedTime: '4 giờ',
    instructor: 'Cô Lan',
    description: 'Nước dùng ngọt thanh từ xương ống, hạt mùi và quế, ăn cùng thịt tái nạm mềm.',
    ingredientsList: buildIngredients('seed-pho-bo-tai-nam', [
      { name: 'Xương ống bò', quantity: '2', unit: 'kg' },
      { name: 'Nạm bò', quantity: '600', unit: 'g' },
      { name: 'Bánh phở', quantity: '500', unit: 'g' },
      { name: 'Gừng nướng', quantity: '1', unit: 'củ' },
      { name: 'Hành tây', quantity: '2', unit: 'củ' },
      { name: 'Gia vị phở', quantity: '1', unit: 'túi' },
    ]),
    favoriteBrands: ['Quế Trà Bồng', 'Nam Đệ Nhất'],
    specialNotes: 'Luôn hớt bọt liên tục để nước dùng trong veo.',
    instructions: buildSteps('seed-pho-bo-tai-nam', [
      { title: 'Nướng gia vị', description: 'Nướng gừng, hành tây, quế và thảo quả cho thơm.' },
      { title: 'Ninh xương', description: 'Trụng xương bò rồi ninh 3 giờ cùng gia vị đã nướng.' },
      { title: 'Sơ chế thịt', description: 'Luộc nạm tới chín mềm, thái lát; phần thịt tái thái thật mỏng.' },
      { title: 'Chuẩn bị bánh phở', description: 'Chần bánh phở với nước sôi, cho vào bát đã tráng nóng.' },
      { title: 'Trình bày', description: 'Xếp nạm, thịt tái, hành lá rồi chan nước dùng đang sôi.' },
    ]),
    tips: 'Có thể thả thêm mỡ gầu nóng vào bát để thơm và béo hơn.',
    coverImage: '/assets/sticker1/ChatGPT Image Nov 4, 2025, 10_24_54 PM.png',
    galleryImages: [
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 10_24_54 PM.png',
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 10_24_56 PM.png',
    ],
    createdAt: buildTimestamp(3),
    updatedAt: buildTimestamp(4, 11),
  },
  {
    id: 'seed-bun-cha-ha-noi',
    dishName: 'Bún chả Hà Nội',
    recipeName: 'Bún chả nướng lá chuối',
    sameAsDish: false,
    difficulty: 'hard',
    cookingTime: 'medium',
    estimateTime: false,
    estimatedTime: '70 phút',
    instructor: 'Ngoại Bắc',
    description: 'Chả viên mềm, chả miếng thơm mùi sả nướng trên than ăn kèm nước chấm chua ngọt.',
    ingredientsList: buildIngredients('seed-bun-cha-ha-noi', [
      { name: 'Thịt ba chỉ', quantity: '600', unit: 'g' },
      { name: 'Thịt nạc vai', quantity: '400', unit: 'g' },
      { name: 'Bún tươi', quantity: '1', unit: 'kg' },
      { name: 'Đu đủ xanh', quantity: '1/2', unit: 'trái' },
      { name: 'Cà rốt', quantity: '1', unit: 'củ' },
      { name: 'Nước mắm ngon', quantity: '6', unit: 'muỗng canh' },
    ]),
    favoriteBrands: ['Phú Quốc', 'Nam Ngư'],
    specialNotes: 'Ướp thịt với nước hàng để màu lên đẹp và thơm.',
    instructions: buildSteps('seed-bun-cha-ha-noi', [
      { title: 'Ướp thịt', description: 'Thái thịt ba chỉ bản mỏng, nạc vai băm; ướp hành khô, sả, nước mắm, đường.' },
      { title: 'Nướng chả', description: 'Kẹp thịt bằng vỉ, nướng than đến khi cháy xém cạnh.' },
      { title: 'Làm nước chấm', description: 'Đun nước mắm với đường, dấm, tỏi ớt; thêm đu đủ, cà rốt ngâm.' },
      { title: 'Chuẩn bị rau', description: 'Rau sống gồm xà lách, tía tô, kinh giới, húng quế rửa sạch.' },
      { title: 'Thưởng thức', description: 'Dọn bún, rau, chả và nước chấm nóng.' },
    ]),
    tips: 'Phết mỡ hành lên vỉ giúp thịt không dính và thơm hơn.',
    coverImage: '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_35_51 PM.png',
    galleryImages: [
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_35_51 PM.png',
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 09_34_31 PM.png',
    ],
    createdAt: buildTimestamp(4),
    updatedAt: buildTimestamp(5),
  },
  {
    id: 'seed-chao-ga-hanh',
    dishName: 'Cháo gà hành',
    recipeName: 'Cháo gà xé hành phi',
    sameAsDish: true,
    difficulty: 'easy',
    cookingTime: 'slow',
    estimateTime: true,
    estimatedTime: '60 phút',
    instructor: 'Má Năm',
    description: 'Cháo gà mềm thơm, nước luộc gà ngọt, ăn sáng ấm bụng.',
    ingredientsList: buildIngredients('seed-chao-ga-hanh', [
      { name: 'Gà ta', quantity: '1', unit: 'con (~1.2kg)' },
      { name: 'Gạo tẻ', quantity: '200', unit: 'g' },
      { name: 'Gạo nếp', quantity: '50', unit: 'g' },
      { name: 'Hành tím', quantity: '5', unit: 'củ' },
      { name: 'Gừng', quantity: '1', unit: 'nhánh' },
      { name: 'Hành lá', quantity: '5', unit: 'nhánh' },
    ]),
    favoriteBrands: ['Chinsu'],
    specialNotes: 'Rang sơ gạo trước khi nấu để cháo thơm và không bị nở nước.',
    instructions: buildSteps('seed-chao-ga-hanh', [
      { title: 'Luộc gà', description: 'Luộc gà với gừng đập dập, chút muối cho đến khi chín tới.' },
      { title: 'Rang gạo', description: 'Rang gạo tẻ và gạo nếp với ít dầu đến khi thơm vàng.' },
      { title: 'Nấu cháo', description: 'Dùng nước luộc gà nấu gạo trong 35 phút, khuấy đều tay.' },
      { title: 'Xé thịt', description: 'Gà chín vớt ra, xé sợi, ướp tiêu và hành phi.' },
      { title: 'Hoàn thiện', description: 'Múc cháo ra tô, thêm thịt gà, hành lá, tiêu và tỏi phi.' },
    ]),
    tips: 'Nếu cháo đặc quá, thêm nước nóng từ từ và khuấy nhẹ tay.',
    coverImage: '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_37 PM.png',
    galleryImages: [
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_37 PM.png',
      '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_42_08 PM.png',
    ],
    createdAt: buildTimestamp(5),
    updatedAt: buildTimestamp(6),
  },
  {
    id: 'seed-banh-xeo-mien-tay',
    dishName: 'Bánh xèo miền Tây',
    recipeName: 'Bánh xèo tôm thịt giòn rụm',
    sameAsDish: false,
    difficulty: 'medium',
    cookingTime: 'medium',
    estimateTime: true,
    estimatedTime: '50 phút',
    instructor: 'Ngoại Bảy',
    description: 'Bánh xèo vỏ mỏng giòn, nhân tôm thịt giá đỗ, ăn kèm rau rừng và nước mắm chua ngọt.',
    ingredientsList: buildIngredients('seed-banh-xeo-mien-tay', [
      { name: 'Bột bánh xèo', quantity: '400', unit: 'g' },
      { name: 'Nước cốt dừa', quantity: '350', unit: 'ml' },
      { name: 'Tôm đất', quantity: '250', unit: 'g' },
      { name: 'Thịt ba chỉ', quantity: '200', unit: 'g' },
      { name: 'Giá đỗ', quantity: '200', unit: 'g' },
      { name: 'Nghệ tươi', quantity: '1', unit: 'nhánh' },
    ]),
    favoriteBrands: ['Việt Hương'],
    specialNotes: 'Đổ bánh ở lửa vừa, xoay chảo nhanh tay để lớp bột thật mỏng.',
    instructions: buildSteps('seed-banh-xeo-mien-tay', [
      { title: 'Pha bột', description: 'Trộn bột bánh xèo với nước cốt dừa, nước lọc, nghệ và để nghỉ 20 phút.' },
      { title: 'Chuẩn bị nhân', description: 'Xào tôm thịt với hành lá, nêm hạt nêm và chút tiêu.' },
      { title: 'Đổ bánh', description: 'Làm nóng chảo, phết dầu, đổ bột rồi xoay chảo cho mỏng.' },
      { title: 'Cho nhân', description: 'Thêm tôm thịt và giá đỗ, đậy nắp 2 phút.' },
      { title: 'Gấp bánh', description: 'Khi viền giòn, gấp đôi và trút ra đĩa cùng rau sống.' },
    ]),
    tips: 'Đổ ít bột để bánh mỏng, thêm dầu mỗi lần đổ để vỏ giòn lâu.',
    coverImage: '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_42_01 PM.png',
    galleryImages: [
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 08_42_01 PM.png',
      '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_27_58 PM.png',
    ],
    createdAt: buildTimestamp(6),
    updatedAt: buildTimestamp(7),
  },
  {
    id: 'seed-lau-thai-hai-san',
    dishName: 'Lẩu thái hải sản',
    recipeName: 'Lẩu Thái hải sản chua cay',
    sameAsDish: true,
    difficulty: 'medium',
    cookingTime: 'medium',
    estimateTime: false,
    estimatedTime: '60 phút',
    instructor: 'Cô Phụng',
    description: 'Nước lẩu chua cay kiểu Tom Yum kết hợp tôm mực nghêu, ăn kèm bún tươi và rau.',
    ingredientsList: buildIngredients('seed-lau-thai-hai-san', [
      { name: 'Tôm sú', quantity: '400', unit: 'g' },
      { name: 'Mực ống', quantity: '300', unit: 'g' },
      { name: 'Nghêu sống', quantity: '500', unit: 'g' },
      { name: 'Sả cây', quantity: '4', unit: 'cây' },
      { name: 'Lá chanh', quantity: '5', unit: 'lá' },
      { name: 'Gia vị Tom Yum', quantity: '1', unit: 'gói' },
    ]),
    favoriteBrands: ['Maepranom', 'Cholimex'],
    specialNotes: 'Đừng cho hải sản quá sớm để giữ độ giòn ngọt.',
    instructions: buildSteps('seed-lau-thai-hai-san', [
      { title: 'Làm nước lẩu', description: 'Phi sả, riềng, cà chua rồi cho nước dùng và gia vị Tom Yum.' },
      { title: 'Nêm vị', description: 'Thêm nước mắm, đường thốt nốt và nước cốt chanh cho đủ vị.' },
      { title: 'Chuẩn bị hải sản', description: 'Rửa sạch tôm, mực, nghêu; khứa mực để khi ăn không co lại.' },
      { title: 'Dọn bàn', description: 'Bày bún, rau muống, nấm và rau thơm quanh nồi lẩu.' },
      { title: 'Thưởng thức', description: 'Khi nước sôi mới trút hải sản vào để giữ độ ngọt.' },
    ]),
    tips: 'Có thể thêm sữa tươi để nước lẩu béo nhẹ và dịu độ cay.',
    coverImage: '/assets/sticker3/ChatGPT Image Nov 4, 2025, 10_24_56 PM.png',
    galleryImages: [
      '/assets/sticker3/ChatGPT Image Nov 4, 2025, 10_24_56 PM.png',
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 10_24_54 PM.png',
    ],
    createdAt: buildTimestamp(7),
    updatedAt: buildTimestamp(8),
  },
  {
    id: 'seed-ga-nuong-mat-ong',
    dishName: 'Gà nướng mật ong',
    recipeName: 'Gà nướng mật ong sả ớt',
    sameAsDish: true,
    difficulty: 'medium',
    cookingTime: 'medium',
    estimateTime: true,
    estimatedTime: '55 phút',
    instructor: 'Mẹ Ba',
    description: 'Gà nướng đậm vị mật ong sả ớt, da giòn vàng óng, thịt bên trong vẫn mềm.',
    ingredientsList: buildIngredients('seed-ga-nuong-mat-ong', [
      { name: 'Gà ta', quantity: '1.2', unit: 'kg' },
      { name: 'Mật ong', quantity: '4', unit: 'muỗng canh' },
      { name: 'Sả băm', quantity: '3', unit: 'muỗng' },
      { name: 'Tỏi băm', quantity: '2', unit: 'muỗng' },
      { name: 'Nước mắm', quantity: '3', unit: 'muỗng canh' },
      { name: 'Ớt bột', quantity: '1', unit: 'muỗng cà phê' },
    ]),
    favoriteBrands: ['Mật ong Hoa Rừng', 'Nam Ngư'],
    specialNotes: 'Phết thêm mật ong ở 10 phút cuối để màu đẹp và không bị đắng.',
    instructions: buildSteps('seed-ga-nuong-mat-ong', [
      { title: 'Ướp gà', description: 'Chà xát gà với muối, rửa sạch rồi ướp hỗn hợp mật ong, sả, tỏi, nước mắm.' },
      { title: 'Làm nóng lò', description: 'Preheat lò ở 200°C 10 phút.' },
      { title: 'Nướng gà', description: 'Đặt gà lên khay, nướng 25 phút mỗi mặt, phết sốt sau mỗi lần trở.' },
      { title: 'Tạo màu', description: 'Ở 5 phút cuối chỉnh lên 220°C cho da vàng giòn.' },
      { title: 'Nghỉ thịt', description: 'Lấy gà ra để nghỉ 10 phút rồi chặt miếng.' },
    ]),
    tips: 'Nhồi ít lá chanh vào bụng gà giúp thơm hơn.',
    coverImage: '/assets/sticker2/tobboki.png',
    galleryImages: [
      '/assets/sticker2/tobboki.png',
      '/assets/sticker2/ChatGPT Image Nov 4, 2025, 10_42_08 PM.png',
    ],
    createdAt: buildTimestamp(8),
    updatedAt: buildTimestamp(9),
  },
  {
    id: 'seed-bo-luc-lac',
    dishName: 'Bò lúc lắc',
    recipeName: 'Bò lúc lắc bơ tỏi',
    sameAsDish: true,
    difficulty: 'easy',
    cookingTime: 'fast',
    estimateTime: true,
    estimatedTime: '30 phút',
    instructor: 'Anh Tư',
    description: 'Thịt bò mềm, áo bơ tỏi thơm, ăn kèm khoai tây chiên và salad chua ngọt.',
    ingredientsList: buildIngredients('seed-bo-luc-lac', [
      { name: 'Thịt bò thăn nội', quantity: '500', unit: 'g' },
      { name: 'Bơ lạt', quantity: '50', unit: 'g' },
      { name: 'Tỏi băm', quantity: '3', unit: 'muỗng' },
      { name: 'Ớt chuông', quantity: '2', unit: 'trái' },
      { name: 'Hành tây', quantity: '1', unit: 'củ' },
      { name: 'Khoai tây', quantity: '2', unit: 'củ' },
    ]),
    favoriteBrands: ['Anchor', 'Phú Quốc'],
    specialNotes: 'Thịt bò chỉ xào nhanh trên lửa lớn để giữ nước.',
    instructions: buildSteps('seed-bo-luc-lac', [
      { title: 'Ướp bò', description: 'Cắt hạt lựu bò, ướp dầu hào, nước mắm, tiêu trong 15 phút.' },
      { title: 'Chiên khoai', description: 'Chiên khoai tây vàng giòn, để ráo dầu.' },
      { title: 'Xào rau', description: 'Xào hành tây, ớt chuông với dầu cho chín tới rồi để ra đĩa.' },
      { title: 'Xào bò', description: 'Cho bơ và tỏi vào chảo nóng, thêm bò đảo 2 phút trên lửa lớn.' },
      { title: 'Hoàn thiện', description: 'Trộn bò với rau, rắc tiêu xay và thưởng thức nóng.' },
    ]),
    tips: 'Làm lạnh thịt sau khi cắt giúp giữ nước khi xào.',
    coverImage: '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_34 PM.png',
    galleryImages: [
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_34 PM.png',
      '/assets/sticker1/ChatGPT Image Nov 4, 2025, 09_34_37 PM.png',
    ],
    createdAt: buildTimestamp(9),
    updatedAt: buildTimestamp(10),
  },
];

async function seed() {
  const batch = firestore.batch();

  sampleRecipes.forEach((recipe) => {
    const docRef = firestore
      .collection('users')
      .doc(userId)
      .collection('recipes')
      .doc(recipe.id);
    batch.set(docRef, recipe);
  });

  await batch.commit();
  console.log(`✅ Seeded ${sampleRecipes.length} recipes for user ${userId}`);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to seed recipes:', error);
    process.exit(1);
  });
