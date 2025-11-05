// Mock data helpers for dev mode auto-fill

export const mockFormData = {
  // Recipe form data
  recipe: {
    dishName: 'Bún chả Hà Nội',
    recipeName: 'Bún chả Hà Nội truyền thống',
    difficulty: 'medium',
    cookingTime: 'medium',
    instructor: 'Bà nội',
    description: 'Món bún chả đặc trưng Hà Nội với thịt nướng thơm phức, bún tươi và nước mắm chua ngọt',
  },

  // Auth forms
  login: {
    email: 'test@example.com',
    password: 'password123',
  },

  register: {
    name: 'Nguyễn Văn Test',
    email: 'test@example.com',
    password: 'password123',
  },

  // Reflection form
  reflection: {
    mistakes: 'Lửa hơi to nên thịt bị khô một chút. Lần sau nên để lửa vừa và nướng lâu hơn.',
    improvements: 'Có thể thêm chút mật ong vào khi ướp thịt để thịt có vị ngọt tự nhiên và màu đẹp hơn.',
  },

  // Shopping list
  shoppingItem: {
    name: 'Thịt ba chỉ',
    quantity: '500',
    unit: 'gram',
    category: 'thit-ca',
  },
};

// Random recipe generator for variety
export const getRandomRecipe = () => {
  const dishes = [
    'Cơm chiên dương châu',
    'Phở bò',
    'Bún bò Huế',
    'Bánh xèo',
    'Gỏi cuốn',
    'Nem rán',
    'Cá kho tộ',
    'Thịt kho tàu',
    'Canh chua cá',
    'Bò lúc lắc',
  ];

  const instructors = [
    'Mẹ',
    'Bà',
    'Cô',
    'Dì',
    'Chú',
    'Bác',
    'Anh',
    'Chị',
  ];

  const difficulties = ['very_easy', 'easy', 'medium', 'hard', 'very_hard'];
  const cookingTimes = ['very_fast', 'fast', 'medium', 'slow', 'very_slow'];

  const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
  const randomInstructor = instructors[Math.floor(Math.random() * instructors.length)];
  const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
  const randomTime = cookingTimes[Math.floor(Math.random() * cookingTimes.length)];

  return {
    dishName: randomDish,
    recipeName: `${randomDish} phiên bản ${randomInstructor}`,
    difficulty: randomDifficulty,
    cookingTime: randomTime,
    instructor: randomInstructor,
    description: `Công thức ${randomDish.toLowerCase()} được ${randomInstructor} truyền lại, đơn giản và ngon miệng.`,
  };
};
