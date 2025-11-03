import { Recipe } from '@/types/recipe';

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    dishName: 'Cơm chiên dương châu',
    recipeName: 'Cơm chiên dương châu',
    difficulty: 'easy',
    cookingTime: 'fast',
    instructor: 'Mẹ',
    description: 'Món cơm chiên thơm ngon, đầy đủ dinh dưỡng với tôm, xúc xích và rau củ',
    createdAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    dishName: 'Phở bò',
    recipeName: 'Phở bò Hà Nội truyền thống',
    difficulty: 'hard',
    cookingTime: 'very_slow',
    instructor: 'Bà',
    description: 'Phở bò truyền thống với nước dùng trong, thịt bò mềm',
    createdAt: new Date('2024-01-10').toISOString(),
  },
  {
    id: '3',
    dishName: 'Gỏi cuốn',
    recipeName: 'Gỏi cuốn tôm thịt',
    difficulty: 'easy',
    cookingTime: 'fast',
    instructor: 'Cô',
    description: 'Gỏi cuốn tươi ngon với tôm, thịt và rau sống',
    createdAt: new Date('2024-01-05').toISOString(),
  },
];
