'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';

interface Instruction {
  id: string;
  step: number;
  title: string;
  hasDescription?: boolean;
  description: string;
  needsTime?: boolean;
  duration?: string;
  hasNote?: boolean;
  note?: string;
}

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  instructions?: string;
  createdAt: string;
}

export default function StepPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const stepNumber = parseInt(params.stepNumber as string, 10);
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<Instruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    // Load recipe from localStorage
    const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    const found = recipes.find((r: Recipe) => r.id === recipeId);
    if (found) {
      setRecipe(found);
      // Parse instructions
      if (found.instructions) {
        try {
          const parsed = JSON.parse(found.instructions);
          const instructionsList = Array.isArray(parsed) ? parsed : [];
          setInstructions(instructionsList);
          
          // Find current instruction
          const current = instructionsList.find((inst: Instruction) => inst.step === stepNumber);
          if (current) {
            setCurrentInstruction(current);
          }
        } catch {
          setInstructions([]);
        }
      }
    }
    setLoading(false);
  }, [recipeId, stepNumber]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft === null || timeLeft <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          setTimerActive(false);
          // Alert when timer ends
          alert('⏰ Thời gian đã hết!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const parseDurationToSeconds = (duration: string): number => {
    // Parse formats like "10 phút", "2 giờ", "30 giây", "1 giờ 30 phút"
    let totalSeconds = 0;
    
    const giờMatch = duration.match(/(\d+)\s*giờ/);
    const phútMatch = duration.match(/(\d+)\s*phút/);
    const giâyMatch = duration.match(/(\d+)\s*giây/);
    
    if (giờMatch) totalSeconds += parseInt(giờMatch[1]) * 3600;
    if (phútMatch) totalSeconds += parseInt(phútMatch[1]) * 60;
    if (giâyMatch) totalSeconds += parseInt(giâyMatch[1]);
    
    return totalSeconds;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (currentInstruction?.needsTime && currentInstruction?.duration) {
      const seconds = parseDurationToSeconds(currentInstruction.duration);
      setTimeLeft(seconds);
      setTimerActive(true);
    }
  };

  const handleNext = () => {
    const nextStep = stepNumber + 1;
    const nextInstruction = instructions.find((inst) => inst.step === nextStep);
    
    if (nextInstruction) {
      router.push(`/cook/${recipeId}/steps/${nextStep}`);
    } else {
      // No more steps, go to reflection page
      router.push(`/cook/${recipeId}/reflection`);
    }
  };

  const handlePrevious = () => {
    if (stepNumber > 1) {
      router.push(`/cook/${recipeId}/steps/${stepNumber - 1}`);
    }
  };

  const isLastStep = !instructions.some((inst) => inst.step > stepNumber);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe || !currentInstruction) {
    return (
      <PageContainer>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bước nấu này</p>
            <GradientButton onClick={() => router.push(`/cook/${recipeId}`)}>
              Quay lại
            </GradientButton>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon="👨‍🍳"
        title={`Bước ${stepNumber}/${instructions.length}`}
        backButton={{
          label: 'Quay lại',
          onClick: () => router.push(`/recipes/${recipeId}`),
        }}
      />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-8">
          {/* Step Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {currentInstruction.title || `Bước ${stepNumber}`}
            </h2>
            <p className="text-gray-600">
              Bước {stepNumber} trong {instructions.length}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stepNumber / instructions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Description */}
          {currentInstruction.hasDescription && currentInstruction.description && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg mb-8">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentInstruction.description}
              </p>
            </div>
          )}

          {/* Timing Info */}
          {currentInstruction.needsTime && currentInstruction.duration && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8">
              <p className="flex items-center gap-2 text-gray-900 mb-4">
                <span className="text-2xl">⏱️</span>
                <span className="font-semibold">Thời gian dự kiến: {currentInstruction.duration}</span>
              </p>
              
              {/* Timer Display */}
              {timerActive && timeLeft !== null ? (
                <div className="text-center">
                  <div className="text-5xl font-bold text-orange-600 mb-4 font-mono">
                    {formatTime(timeLeft)}
                  </div>
                  <button
                    onClick={() => setTimerActive(false)}
                    className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors mb-4"
                  >
                    Dừng bộ đếm
                  </button>
                  <p className="text-sm text-gray-600 italic">
                    💡 Trong lúc chờ, bạn có thể thực hiện trước một số bước khác, hoặc chuẩn bị gia vị, hoặc xử lý phần nguyên liệu còn lại
                  </p>
                </div>
              ) : (
                <button
                  onClick={startTimer}
                  className="bg-yellow-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  ▶ Bắt đầu bộ đếm
                </button>
              )}
            </div>
          )}

          {/* Note Info */}
          {currentInstruction.hasNote && currentInstruction.note && (
            <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-8">
              <p className="flex items-center gap-2 text-gray-900 mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">Lưu ý quan trọng</span>
              </p>
              <p className="text-gray-700">{currentInstruction.note}</p>
            </div>
          )}

          {/* Completed Checkbox */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8 flex items-center gap-3">
            <input
              type="checkbox"
              id="completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-6 h-6 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <label htmlFor="completed" className="font-semibold text-gray-900">
              Tôi đã hoàn thành bước này
            </label>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={stepNumber === 1}
              className="bg-gray-200 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Bước trước
            </button>
            <button
              onClick={handleNext}
              disabled={!completed}
              className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastStep ? 'Hoàn thành →' : 'Bước tiếp theo →'}
            </button>
          </div>
        </div>
      </main>
    </PageContainer>
  );
}
