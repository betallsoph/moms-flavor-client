const mockRecipes = [
  {
    id: '1',
    name: 'Cơm chiên Thái',
    ingredients: '2 bát cơm\n3 trứng\n2 cà chua\n1 cái dưa chuột\n2 thìa nước mắm\n2 tép tỏi',
    instructions: 'Bước 1: Đánh tan trứng\nBước 2: Cho dầu vào chảo, nấu tỏi thơm\nBước 3: Xào trứng cho chín\nBước 4: Cho cơm vào xào cùng\nBước 5: Nêm nước mắm và gia vị\nBước 6: Thêm rau và trộn đều',
    spiceLevel: 'medium',
    person: 'Mẹ',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    name: 'Phở gà',
    ingredients: '500g gà\n1 lít nước dùng\n100g bánh phở\n2 hành\n2 tép tỏi\n1 miếng gừng\n2 thìa nước mắm',
    instructions: 'Bước 1: Nấu nước dùng từ gà\nBước 2: Luộc bánh phở\nBước 3: Xào hành tỏi\nBước 4: Nêm gia vị nước dùng\nBước 5: Cho bánh phở vào tô\nBước 6: Đổ nước dùng nóng vào',
    spiceLevel: 'mild',
    person: 'Ông',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '3',
    name: 'Mực xào cay',
    ingredients: '500g mực tươi\n3 ớt đỏ\n2 hành tây\n4 tép tỏi\n2 thìa dầu ăn\n1 thìa nước mắm',
    instructions: 'Bước 1: Làm sạch mực\nBước 2: Cắt hành tây thành từng khía\nBước 3: Xào tỏi ớt thơm\nBước 4: Cho mực vào xào\nBước 5: Nêm gia vị\nBước 6: Xào đều cho mực chín',
    spiceLevel: 'hot',
    person: 'Bà',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

console.log('Mock data recipes:');
console.log(JSON.stringify(mockRecipes, null, 2));
