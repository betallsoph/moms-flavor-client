import { NextResponse } from 'next/server';
import { createRecipe } from '@/libs/firestore';

export const runtime = 'nodejs';

const sampleRecipes = [
  {
    dishName: 'Thịt kho trứng cút',
    recipeName: 'Thịt kho trứng cút kiểu miền Nam',
    difficulty: 'easy' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '45 phút',
    instructor: 'Mẹ',
    description: 'Món thịt kho trứng cút đậm đà, thơm ngon, là món ăn truyền thống không thể thiếu trong mâm cơm ngày Tết của người miền Nam.',
    ingredientsList: [
      { id: '1', name: 'Thịt ba chỉ', quantity: '500', unit: 'g' },
      { id: '2', name: 'Trứng cút', quantity: '20', unit: 'quả' },
      { id: '3', name: 'Nước dừa tươi', quantity: '400', unit: 'ml' },
      { id: '4', name: 'Nước mắm', quantity: '3', unit: 'muỗng canh' },
      { id: '5', name: 'Đường', quantity: '2', unit: 'muỗng canh' },
      { id: '6', name: 'Tỏi băm', quantity: '1', unit: 'muỗng canh' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế', description: 'Thịt ba chỉ rửa sạch, cắt miếng vuông 3cm. Trứng cút luộc chín, bóc vỏ.' },
      { id: '2', step: 2, title: 'Ướp thịt', description: 'Ướp thịt với 2 muỗng nước mắm, 1 muỗng đường, tỏi băm trong 20 phút.' },
      { id: '3', step: 3, title: 'Thắng màu', description: 'Cho đường vào nồi, đun nhỏ lửa đến khi đường chuyển màu cánh gián.' },
      { id: '4', step: 4, title: 'Kho thịt', description: 'Cho thịt vào xào săn, thêm nước dừa, đun sôi rồi hạ nhỏ lửa kho 30 phút.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Thêm trứng cút, kho thêm 10 phút cho ngấm. Nêm nếm lại cho vừa ăn.' },
    ]),
    tips: 'Kho lửa nhỏ để thịt mềm và ngấm gia vị. Nước dừa tươi sẽ cho vị ngọt thanh hơn.',
    coverImage: 'https://images.unsplash.com/photo-1623689046286-addba6204e87?w=800&q=80',
  },
  {
    dishName: 'Phở bò',
    recipeName: 'Phở bò Hà Nội truyền thống',
    difficulty: 'hard' as const,
    cookingTime: 'very_slow' as const,
    estimatedTime: '4-5 tiếng',
    instructor: 'Bà ngoại',
    description: 'Phở bò Hà Nội với nước dùng trong, ngọt từ xương, thơm mùi gia vị đặc trưng.',
    ingredientsList: [
      { id: '1', name: 'Xương bò', quantity: '1.5', unit: 'kg' },
      { id: '2', name: 'Thịt bò (nạm, gầu, tái)', quantity: '500', unit: 'g' },
      { id: '3', name: 'Bánh phở', quantity: '500', unit: 'g' },
      { id: '4', name: 'Hành tây', quantity: '2', unit: 'củ' },
      { id: '5', name: 'Gừng', quantity: '1', unit: 'củ' },
      { id: '6', name: 'Quế, hồi, thảo quả', quantity: '1', unit: 'gói' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Ninh xương', description: 'Xương bò chần qua nước sôi, rửa sạch. Ninh với 4 lít nước trong 3-4 tiếng, vớt bọt thường xuyên.' },
      { id: '2', step: 2, title: 'Nướng gia vị', description: 'Nướng hành tây, gừng trên bếp đến cháy xém. Rang quế, hồi, thảo quả cho thơm.' },
      { id: '3', step: 3, title: 'Nấu nước dùng', description: 'Cho hành, gừng, gia vị vào nồi nước dùng. Nêm nước mắm, muối, đường.' },
      { id: '4', step: 4, title: 'Chuẩn bị thịt', description: 'Thịt bò thái lát mỏng. Nạm, gầu luộc chín rồi thái.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Trụng bánh phở, xếp thịt, chan nước dùng nóng. Ăn kèm rau thơm, giá, chanh, ớt.' },
    ]),
    tips: 'Nước dùng ngon nhờ ninh lửa nhỏ và vớt bọt kỹ. Hành gừng nướng cháy sẽ cho màu và vị đặc trưng.',
    coverImage: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
  },
  {
    dishName: 'Cơm tấm sườn bì chả',
    recipeName: 'Cơm tấm Sài Gòn',
    difficulty: 'medium' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '1 tiếng',
    instructor: 'Ba',
    description: 'Cơm tấm với sườn nướng thơm lừng, bì giòn giòn và chả trứng béo ngậy - món ăn sáng đặc trưng Sài Gòn.',
    ingredientsList: [
      { id: '1', name: 'Sườn heo', quantity: '4', unit: 'miếng' },
      { id: '2', name: 'Bì heo', quantity: '200', unit: 'g' },
      { id: '3', name: 'Trứng', quantity: '3', unit: 'quả' },
      { id: '4', name: 'Thịt heo xay', quantity: '200', unit: 'g' },
      { id: '5', name: 'Gạo tấm', quantity: '400', unit: 'g' },
      { id: '6', name: 'Mỡ hành', quantity: '3', unit: 'muỗng canh' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Ướp sườn', description: 'Ướp sườn với sả, tỏi, nước mắm, đường, dầu hào trong 2 tiếng hoặc qua đêm.' },
      { id: '2', step: 2, title: 'Làm bì', description: 'Bì heo luộc chín, thái sợi nhỏ, trộn với thính gạo.' },
      { id: '3', step: 3, title: 'Làm chả', description: 'Trộn thịt xay với trứng, nước mắm, tiêu. Hấp 20 phút đến chín.' },
      { id: '4', step: 4, title: 'Nướng sườn', description: 'Nướng sườn trên than hoặc lò đến vàng đều, thơm lừng.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Nấu cơm tấm, xới ra đĩa, xếp sườn, bì, chả. Rưới mỡ hành, ăn kèm đồ chua và nước mắm.' },
    ]),
    tips: 'Sườn ướp qua đêm sẽ ngấm hơn. Nướng than cho mùi thơm đặc trưng hơn nướng lò.',
    coverImage: 'https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=800&q=80',
  },
  {
    dishName: 'Bún chả Hà Nội',
    recipeName: 'Bún chả nướng than',
    difficulty: 'medium' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '1 tiếng',
    instructor: 'Mẹ',
    description: 'Bún chả Hà Nội với chả viên và thịt ba chỉ nướng than, ăn kèm nước mắm chua ngọt.',
    ingredientsList: [
      { id: '1', name: 'Thịt ba chỉ', quantity: '300', unit: 'g' },
      { id: '2', name: 'Thịt nạc vai xay', quantity: '300', unit: 'g' },
      { id: '3', name: 'Bún tươi', quantity: '500', unit: 'g' },
      { id: '4', name: 'Rau sống các loại', quantity: '1', unit: 'đĩa' },
      { id: '5', name: 'Nước mắm', quantity: '100', unit: 'ml' },
      { id: '6', name: 'Đường, giấm, tỏi ớt', quantity: '1', unit: 'phần' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Ướp thịt', description: 'Thịt ba chỉ thái lát mỏng, ướp với nước mắm, đường, tỏi, tiêu. Thịt xay vo viên nhỏ, ướp tương tự.' },
      { id: '2', step: 2, title: 'Làm nước chấm', description: 'Pha nước mắm, đường, giấm, nước theo tỉ lệ 1:1:1:3. Thêm tỏi ớt băm.' },
      { id: '3', step: 3, title: 'Nướng chả', description: 'Nướng thịt và chả viên trên than hoa đến vàng thơm, cháy cạnh nhẹ.' },
      { id: '4', step: 4, title: 'Chuẩn bị rau', description: 'Rửa sạch rau sống: xà lách, kinh giới, tía tô, húng quế.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Bày bún ra đĩa, chả ra bát nước mắm. Ăn kèm rau sống.' },
    ]),
    tips: 'Thịt nướng than mới có mùi khói đặc trưng. Nước mắm pha đúng tỉ lệ là linh hồn của món.',
    coverImage: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80',
  },
  {
    dishName: 'Canh chua cá lóc',
    recipeName: 'Canh chua miền Tây',
    difficulty: 'easy' as const,
    cookingTime: 'fast' as const,
    estimatedTime: '30 phút',
    instructor: 'Bà nội',
    description: 'Canh chua cá lóc đậm chất miền Tây với vị chua thanh từ me, ngọt từ cá và thơm từ rau.',
    ingredientsList: [
      { id: '1', name: 'Cá lóc', quantity: '1', unit: 'con (600g)' },
      { id: '2', name: 'Me chín', quantity: '50', unit: 'g' },
      { id: '3', name: 'Cà chua', quantity: '2', unit: 'quả' },
      { id: '4', name: 'Thơm (dứa)', quantity: '1/4', unit: 'quả' },
      { id: '5', name: 'Đậu bắp, giá đỗ', quantity: '200', unit: 'g' },
      { id: '6', name: 'Rau ngổ, ngò gai', quantity: '1', unit: 'nắm' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế cá', description: 'Cá lóc làm sạch, cắt khúc 3cm. Ướp nhẹ với muối, tiêu.' },
      { id: '2', step: 2, title: 'Nấu nước me', description: 'Me chín ngâm nước nóng, bóp lấy nước chua.' },
      { id: '3', step: 3, title: 'Nấu canh', description: 'Đun sôi nước, cho cà chua, thơm vào. Thêm nước me, nêm nước mắm, đường.' },
      { id: '4', step: 4, title: 'Cho cá', description: 'Nước sôi lại thì cho cá vào, nấu 5-7 phút đến cá chín.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Cho đậu bắp, giá. Tắt bếp, thêm rau ngổ, ngò gai. Nêm lại vừa ăn.' },
    ]),
    tips: 'Không khuấy nhiều để cá không bị nát. Rau thơm cho vào sau cùng để giữ màu và mùi.',
    coverImage: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80',
  },
  {
    dishName: 'Gà kho gừng',
    recipeName: 'Gà kho gừng mặn ngọt',
    difficulty: 'easy' as const,
    cookingTime: 'fast' as const,
    estimatedTime: '35 phút',
    instructor: 'Mẹ',
    description: 'Gà kho gừng thơm nồng, đậm đà, món ăn dân dã nhưng rất đưa cơm.',
    ingredientsList: [
      { id: '1', name: 'Đùi gà', quantity: '500', unit: 'g' },
      { id: '2', name: 'Gừng', quantity: '1', unit: 'củ lớn' },
      { id: '3', name: 'Nước mắm', quantity: '3', unit: 'muỗng canh' },
      { id: '4', name: 'Đường', quantity: '1.5', unit: 'muỗng canh' },
      { id: '5', name: 'Hành tím', quantity: '3', unit: 'củ' },
      { id: '6', name: 'Ớt', quantity: '2', unit: 'quả' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế', description: 'Gà chặt miếng vừa ăn, rửa sạch, để ráo. Gừng thái sợi hoặc đập dập.' },
      { id: '2', step: 2, title: 'Ướp gà', description: 'Ướp gà với nước mắm, đường, tiêu, hành tím băm trong 15 phút.' },
      { id: '3', step: 3, title: 'Xào gừng', description: 'Phi thơm hành tím, cho gừng vào xào cho dậy mùi.' },
      { id: '4', step: 4, title: 'Kho gà', description: 'Cho gà vào xào săn, thêm 1/2 chén nước, kho lửa nhỏ 20 phút.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Kho đến khi nước sệt lại, thêm ớt. Nêm nếm lại, rắc tiêu.' },
    ]),
    tips: 'Gừng già sẽ thơm và cay hơn gừng non. Kho lửa nhỏ để gà mềm và ngấm gia vị.',
    coverImage: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
  },
  {
    dishName: 'Chả giò (Nem rán)',
    recipeName: 'Chả giò giòn rụm',
    difficulty: 'medium' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '1 tiếng',
    instructor: 'Bà ngoại',
    description: 'Chả giò vỏ giòn rụm, nhân thơm ngon với thịt, tôm, miến và rau củ.',
    ingredientsList: [
      { id: '1', name: 'Bánh tráng', quantity: '20', unit: 'cái' },
      { id: '2', name: 'Thịt heo xay', quantity: '300', unit: 'g' },
      { id: '3', name: 'Tôm băm', quantity: '150', unit: 'g' },
      { id: '4', name: 'Miến', quantity: '50', unit: 'g' },
      { id: '5', name: 'Cà rốt, khoai môn', quantity: '100', unit: 'g' },
      { id: '6', name: 'Mộc nhĩ, nấm hương', quantity: '20', unit: 'g' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế', description: 'Miến ngâm mềm, cắt ngắn. Mộc nhĩ, nấm ngâm nở, băm nhỏ. Cà rốt, khoai bào sợi.' },
      { id: '2', step: 2, title: 'Làm nhân', description: 'Trộn tất cả: thịt, tôm, miến, rau củ, nấm với trứng, nước mắm, tiêu.' },
      { id: '3', step: 3, title: 'Cuốn chả', description: 'Bánh tráng làm ẩm, cho nhân vào cuốn chặt tay, gấp 2 đầu vào.' },
      { id: '4', step: 4, title: 'Chiên chả', description: 'Chiên ngập dầu, lửa vừa đến khi vàng giòn đều. Vớt ra để ráo dầu.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Ăn nóng với bún, rau sống và nước mắm chua ngọt.' },
    ]),
    tips: 'Chiên 2 lần: lần 1 lửa vừa cho chín trong, lần 2 lửa lớn cho giòn vỏ.',
    coverImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
  },
  {
    dishName: 'Bò lúc lắc',
    recipeName: 'Bò lúc lắc kiểu Việt',
    difficulty: 'easy' as const,
    cookingTime: 'very_fast' as const,
    estimatedTime: '20 phút',
    instructor: 'Ba',
    description: 'Bò lúc lắc mềm ngọt, thơm bơ tỏi, món ăn nhanh gọn nhưng sang trọng.',
    ingredientsList: [
      { id: '1', name: 'Thịt bò thăn', quantity: '400', unit: 'g' },
      { id: '2', name: 'Bơ', quantity: '2', unit: 'muỗng canh' },
      { id: '3', name: 'Tỏi băm', quantity: '3', unit: 'muỗng canh' },
      { id: '4', name: 'Hành tây', quantity: '1', unit: 'củ' },
      { id: '5', name: 'Ớt chuông', quantity: '1', unit: 'quả' },
      { id: '6', name: 'Xì dầu, dầu hào', quantity: '2', unit: 'muỗng canh mỗi loại' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế', description: 'Bò cắt hạt lựu 2cm. Ướp với xì dầu, dầu hào, tiêu, tỏi trong 15 phút.' },
      { id: '2', step: 2, title: 'Chuẩn bị rau', description: 'Hành tây, ớt chuông cắt miếng vuông bằng thịt bò.' },
      { id: '3', step: 3, title: 'Xào bò', description: 'Chảo thật nóng, cho bơ + dầu. Cho bò vào đảo nhanh tay lửa lớn 1-2 phút.' },
      { id: '4', step: 4, title: 'Xào rau', description: 'Vớt bò ra, xào hành tây, ớt chuông cho hơi mềm.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Cho bò vào đảo đều, nêm nếm. Ăn với cơm nóng hoặc bánh mì.' },
    ]),
    tips: 'Chảo phải thật nóng và xào nhanh để bò không ra nước, giữ được độ mềm.',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  },
  {
    dishName: 'Bánh xèo',
    recipeName: 'Bánh xèo miền Nam',
    difficulty: 'medium' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '45 phút',
    instructor: 'Mẹ',
    description: 'Bánh xèo giòn rụm, nhân tôm thịt đầy đặn, ăn kèm rau sống cuốn bánh tráng.',
    ingredientsList: [
      { id: '1', name: 'Bột bánh xèo', quantity: '300', unit: 'g' },
      { id: '2', name: 'Tôm sú', quantity: '200', unit: 'g' },
      { id: '3', name: 'Thịt ba chỉ', quantity: '200', unit: 'g' },
      { id: '4', name: 'Giá đỗ', quantity: '200', unit: 'g' },
      { id: '5', name: 'Nước cốt dừa', quantity: '200', unit: 'ml' },
      { id: '6', name: 'Hành lá, nghệ', quantity: '1', unit: 'phần' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Pha bột', description: 'Trộn bột với nước cốt dừa, nước lọc, nghệ, hành lá. Để 30 phút cho bột nở.' },
      { id: '2', step: 2, title: 'Sơ chế nhân', description: 'Tôm bóc vỏ. Thịt thái lát mỏng. Ướp nhẹ với muối tiêu.' },
      { id: '3', step: 3, title: 'Đổ bánh', description: 'Chảo nóng, cho dầu. Xào tôm thịt sơ, múc bột đổ vào tráng mỏng.' },
      { id: '4', step: 4, title: 'Chiên giòn', description: 'Đậy nắp 1 phút, mở nắp cho giá vào, chiên đến khi bánh giòn vàng.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Gập đôi bánh, bày ra đĩa. Ăn với rau sống, bánh tráng và nước mắm.' },
    ]),
    tips: 'Bột phải để nghỉ cho nở đều. Chiên lửa vừa, nhiều dầu để bánh giòn.',
    coverImage: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80',
  },
  {
    dishName: 'Cà ri gà',
    recipeName: 'Cà ri gà kiểu Việt',
    difficulty: 'easy' as const,
    cookingTime: 'medium' as const,
    estimatedTime: '50 phút',
    instructor: 'Mẹ',
    description: 'Cà ri gà thơm béo với nước cốt dừa, khoai tây bở tơi, ăn với bánh mì nóng.',
    ingredientsList: [
      { id: '1', name: 'Đùi gà', quantity: '600', unit: 'g' },
      { id: '2', name: 'Khoai tây', quantity: '2', unit: 'củ' },
      { id: '3', name: 'Cà rốt', quantity: '1', unit: 'củ' },
      { id: '4', name: 'Nước cốt dừa', quantity: '400', unit: 'ml' },
      { id: '5', name: 'Bột cà ri', quantity: '3', unit: 'muỗng canh' },
      { id: '6', name: 'Sả, hành tím, tỏi', quantity: '1', unit: 'phần' },
    ],
    instructions: JSON.stringify([
      { id: '1', step: 1, title: 'Sơ chế', description: 'Gà chặt miếng vừa. Khoai tây, cà rốt gọt vỏ cắt miếng. Sả đập dập.' },
      { id: '2', step: 2, title: 'Ướp gà', description: 'Ướp gà với 1 muỗng bột cà ri, nước mắm, đường trong 15 phút.' },
      { id: '3', step: 3, title: 'Phi thơm', description: 'Phi hành tỏi, cho sả vào xào thơm. Thêm bột cà ri còn lại đảo đều.' },
      { id: '4', step: 4, title: 'Nấu cà ri', description: 'Cho gà vào xào săn, thêm khoai, cà rốt. Đổ nước cốt dừa, nấu 30 phút.' },
      { id: '5', step: 5, title: 'Hoàn thành', description: 'Nấu đến khi khoai mềm, nước sệt lại. Nêm nếm vừa ăn. Ăn với bánh mì.' },
    ]),
    tips: 'Cho nước cốt dừa từ từ để không bị tách. Nấu lửa nhỏ cho khoai không nát.',
    coverImage: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=80',
  },
];

export async function POST(request: Request) {
  try {
    // Check for admin key (simple protection)
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('key');

    if (adminKey !== 'seed-moms-flavor-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const createdRecipes = [];

    for (const recipe of sampleRecipes) {
      const recipeId = await createRecipe(userId, recipe);
      createdRecipes.push({ id: recipeId, name: recipe.dishName });
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdRecipes.length} sample recipes`,
      recipes: createdRecipes,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint with { userId: "your-user-id" } and ?key=seed-moms-flavor-2024',
    sampleCount: sampleRecipes.length,
  });
}
