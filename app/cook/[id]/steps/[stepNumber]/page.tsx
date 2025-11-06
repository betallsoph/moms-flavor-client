'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageContainer, PageHeader, LoadingSpinner, GradientButton } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';
import type { Recipe } from '@/types/recipe';

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

function StepPageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const recipeId = params.id as string;
  const stepNumber = parseInt(params.stepNumber as string, 10);
  const autostart = searchParams.get('autostart') === 'true';
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<Instruction | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Record<number, { endTime: number; duration: string }>>({});
  const [completedTimers, setCompletedTimers] = useState<Set<number>>(new Set());
  const [, forceUpdate] = useState(0); // Force re-render for sidebar timers

  useEffect(() => {
    // Load recipe from RecipeService
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
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
      
      // Load active timers from localStorage
      const savedTimers = localStorage.getItem(`cook-timers-${recipeId}`);
      if (savedTimers) {
        setActiveTimers(JSON.parse(savedTimers));
      }
      
      // Load completed timers from localStorage
      const savedCompletedTimers = localStorage.getItem(`cook-completed-${recipeId}`);
      if (savedCompletedTimers) {
        setCompletedTimers(new Set(JSON.parse(savedCompletedTimers)));
      }
      
      setLoading(false);
    };
    
    loadRecipe();
  }, [recipeId, stepNumber]);

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

  const startTimer = useCallback(() => {
    if (currentInstruction?.needsTime && currentInstruction?.duration) {
      const seconds = parseDurationToSeconds(currentInstruction.duration);
      const endTime = Date.now() + seconds * 1000;
      
      // Update active timers
      const newTimers = {
        ...activeTimers,
        [stepNumber]: { endTime, duration: currentInstruction.duration }
      };
      setActiveTimers(newTimers);
      localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(newTimers));
      
      setTimeLeft(seconds);
      setTimerActive(true);
      setHasShownWarning(false);
    }
  }, [currentInstruction, activeTimers, stepNumber, recipeId]);

  // Function to start timer for any step (from preview panel)
  const startTimerForStep = useCallback((step: number, duration: string) => {
    const seconds = parseDurationToSeconds(duration);
    const endTime = Date.now() + seconds * 1000;
    
    const newTimers = {
      ...activeTimers,
      [step]: { endTime, duration }
    };
    setActiveTimers(newTimers);
    localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(newTimers));
  }, [activeTimers, recipeId]);

  // Auto-start timer if autostart=true in URL
  useEffect(() => {
    if (autostart && currentInstruction?.needsTime && currentInstruction?.duration && !timerActive && !activeTimers[stepNumber]) {
      // Small delay to ensure UI is ready
      const timeout = setTimeout(() => {
        startTimer();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [autostart, currentInstruction, timerActive, startTimer, activeTimers, stepNumber]);

  // Sync timer with active timers from localStorage
  useEffect(() => {
    const timer = activeTimers[stepNumber];
    if (timer) {
      const remaining = Math.floor((timer.endTime - Date.now()) / 1000);
      if (remaining > 0) {
        setTimeLeft(remaining);
        setTimerActive(true);
      } else {
        // Timer expired, remove it
        const newTimers = { ...activeTimers };
        delete newTimers[stepNumber];
        setActiveTimers(newTimers);
        localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(newTimers));
      }
    }
  }, [stepNumber, activeTimers, recipeId]);

  // Global timer tick for all active timers
  useEffect(() => {
    if (Object.keys(activeTimers).length === 0) return;

    const updateTimers = () => {
      const now = Date.now();
      
      Object.keys(activeTimers).forEach(stepKey => {
        const step = parseInt(stepKey);
        const timer = activeTimers[step];
        const remaining = Math.floor((timer.endTime - now) / 1000);

        // Update current step's timeLeft
        if (step === stepNumber) {
          if (remaining > 0) {
            setTimeLeft(remaining);
            setTimerActive(true);
            
            // Warning at 30 seconds
            if (remaining <= 30 && !hasShownWarning) {
              setHasShownWarning(true);
            }
          } else {
            // Timer expired on current step
            setTimerActive(false);
            setTimeLeft(0);
          }
        }
      });
    };

    // Update immediately on mount/change
    updateTimers();

    // Then update every second
    const interval = setInterval(updateTimers, 1000);

    return () => clearInterval(interval);
  }, [activeTimers, stepNumber, hasShownWarning]);

  // Force re-render sidebar every second to update all timer displays
  useEffect(() => {
    if (Object.keys(activeTimers).length === 0) return;

    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-orange-100 p-8 mb-8">
          {/* Step Header - More prominent */}
          <div className="mb-8 flex items-start gap-4">
            {/* Big Step Number Badge */}
            <div className="flex-shrink-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl p-4 shadow-lg">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Bước</p>
                <p className="text-4xl font-bold">{stepNumber}</p>
                <p className="text-xs opacity-90 mt-1">/ {instructions.length}</p>
              </div>
            </div>
            
            {/* Title */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {currentInstruction.title || `Bước ${stepNumber}`}
              </h2>
              <p className="text-gray-600">
                {stepNumber === 1 ? 'Bước đầu tiên' : stepNumber === instructions.length ? 'Bước cuối cùng' : `Còn ${instructions.length - stepNumber} bước nữa`}
              </p>
            </div>
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
                    onClick={() => {
                      setTimerActive(false);
                      // Remove timer from activeTimers
                      const newTimers = { ...activeTimers };
                      delete newTimers[stepNumber];
                      setActiveTimers(newTimers);
                      localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(newTimers));
                    }}
                    className="bg-red-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-600 transition-colors mb-4"
                  >
                    Dừng bộ đếm
                  </button>
                  <p className="text-sm text-gray-600 italic">
                    💡 Trong lúc chờ, bạn có thể xem trước các bước tiếp theo bên dưới để chuẩn bị tốt hơn.
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
          <div 
            className={`relative overflow-hidden rounded-2xl p-6 mb-8 cursor-pointer transition-all duration-300 border-2 ${
              completedTimers.has(stepNumber)
                ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-300 shadow-md' 
                : 'bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-orange-200 hover:border-orange-300 hover:shadow-md'
            }`}
            onClick={() => {
              const newSet = new Set(completedTimers);
              if (completedTimers.has(stepNumber)) {
                newSet.delete(stepNumber);
              } else {
                newSet.add(stepNumber);
              }
              setCompletedTimers(newSet);
              localStorage.setItem(`cook-completed-${recipeId}`, JSON.stringify(Array.from(newSet)));
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                completedTimers.has(stepNumber)
                  ? 'bg-green-500 border-green-500 scale-110' 
                  : 'bg-white border-gray-300'
              }`}>
                {completedTimers.has(stepNumber) && (
                  <svg 
                    className="w-5 h-5 text-white animate-bounce" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="3" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-semibold transition-colors duration-300 ${
                  completedTimers.has(stepNumber) ? 'text-green-700' : 'text-gray-900'
                }`}>
                  {completedTimers.has(stepNumber) ? '✨ Tuyệt vời! Bạn đã hoàn thành bước này!' : '👆 Đánh dấu hoàn thành bước này'}
                </p>
                {completedTimers.has(stepNumber) && (
                  <p className="text-xs text-green-600 mt-1 animate-fadeIn">
                    Bạn có thể tiếp tục sang bước tiếp theo rồi!
                  </p>
                )}
              </div>
              
              <span className="text-3xl">
                {completedTimers.has(stepNumber) ? '🎉' : '📝'}
              </span>
            </div>
          </div>

          {/* NEW STYLE - Duolingo Style Big Continue Button */}
          <div className="mt-12 mb-8">
            {isLastStep && (() => {
              // Check if all steps are completed
              const allStepsCompleted = instructions.every(inst => completedTimers.has(inst.step));
              
              return !allStepsCompleted ? (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-4">
                  <p className="text-yellow-800 font-semibold text-center mb-2">
                    ⚠️ Chưa hoàn thành tất cả các bước
                  </p>
                  <p className="text-yellow-700 text-sm text-center">
                    Vui lòng đánh dấu hoàn thành tất cả {instructions.length} bước trước khi kết thúc món ăn
                  </p>
                  <div className="mt-3 text-center">
                    <span className="text-yellow-600 font-semibold">
                      Đã hoàn thành: {completedTimers.size}/{instructions.length} bước
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
            
            <button
              onClick={() => {
                if (isLastStep) {
                  // Check if all steps are completed
                  const allStepsCompleted = instructions.every(inst => completedTimers.has(inst.step));
                  if (!allStepsCompleted) {
                    return; // Don't proceed if not all steps completed
                  }
                }
                
                // If current step is marked as completed, stop its timer
                if (completedTimers.has(stepNumber) && activeTimers[stepNumber]) {
                  const newTimers = { ...activeTimers };
                  delete newTimers[stepNumber];
                  setActiveTimers(newTimers);
                  setTimerActive(false);
                  localStorage.setItem(`cook-timers-${recipeId}`, JSON.stringify(newTimers));
                }
                
                setCompleted(true);
                // Small delay for visual feedback, then navigate
                setTimeout(() => {
                  handleNext();
                }, 600);
              }}
              disabled={isLastStep && !instructions.every(inst => completedTimers.has(inst.step))}
              className={`w-full font-bold text-xl py-5 px-8 rounded-2xl shadow-lg transform transition-all duration-200 flex items-center justify-center gap-3 ${
                isLastStep && !instructions.every(inst => completedTimers.has(inst.step))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-xl hover:scale-105 active:scale-95'
              }`}
            >
              <span>✓</span>
              <span>{isLastStep ? 'HOÀN THÀNH' : 'TIẾP TỤC'}</span>
            </button>
            
            {/* Previous button - smaller, secondary */}
            {stepNumber > 1 && (
              <button
                onClick={handlePrevious}
                className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                ← Quay lại bước trước
              </button>
            )}
          </div>

          {/* OLD STYLE - Navigation Buttons (DISABLED) */}
          {/* <div className="flex gap-4">
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
          </div> */}
        </div>
      </div>

      {/* Right Sidebar - Timer Tracking */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          {/* Timers - Always show */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span>Bộ đếm thời gian</span>
            </h3>
            {Object.keys(activeTimers).length > 0 ? (
              <div className="space-y-3">
                {Object.keys(activeTimers).map(stepKey => {
                  const step = parseInt(stepKey);
                  const timer = activeTimers[step];
                  const remaining = Math.floor((timer.endTime - Date.now()) / 1000);
                  const isCurrent = step === stepNumber;
                  
                  return (
                    <div
                      key={step}
                      className={`bg-white border-2 rounded-lg p-4 transition-all ${
                        isCurrent 
                          ? 'border-orange-400 shadow-md' 
                          : 'border-green-200 hover:border-green-400 cursor-pointer'
                      }`}
                      onClick={() => !isCurrent && router.push(`/cook/${recipeId}/steps/${step}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-base font-semibold text-gray-700 flex items-center gap-2">
                          Bước {step} {isCurrent && '(hiện tại)'}
                          {remaining > 0 && remaining <= 30 && (
                            <span className="text-xl animate-pulse">⏰</span>
                          )}
                        </p>
                        {isCurrent && (
                          <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Đang xem
                          </span>
                        )}
                      </div>
                      {remaining > 0 ? (
                        <>
                          <p className="text-3xl font-bold text-green-600 font-mono">
                            {formatTime(remaining)}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{timer.duration}</p>
                        </>
                      ) : completedTimers.has(step) ? (
                        <>
                          <p className="text-3xl font-bold text-gray-400 font-mono line-through">
                            0:00
                          </p>
                          <p className="text-sm text-green-600 font-semibold mt-2">✓ Đã hoàn thành</p>
                        </>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-red-600 font-mono animate-pulse">
                            0:00
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm text-red-600 font-semibold">⚠️ Hết thời gian!</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newSet = new Set(completedTimers);
                                newSet.add(step);
                                setCompletedTimers(newSet);
                                localStorage.setItem(`cook-completed-${recipeId}`, JSON.stringify(Array.from(newSet)));
                              }}
                              className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition-colors font-semibold"
                            >
                              Hoàn thành
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">Chưa có timer nào đang chạy</p>
                <p className="text-gray-400 text-xs mt-1">Bắt đầu timer từ các bước bên dưới</p>
              </div>
            )}
          </div>

          {/* Previous Steps - Show if there are previous steps */}
          {instructions.some((inst) => inst.step < stepNumber) && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                <span>Các bước trước</span>
              </h3>
              
              <div className="space-y-3">
                {instructions
                  .filter((inst) => inst.step < stepNumber)
                  .reverse()
                  .map((inst) => (
                    <div 
                      key={inst.id} 
                      className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        {/* Step Number Badge */}
                        <div className="flex-shrink-0 bg-gradient-to-br from-purple-400 to-pink-400 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-base shadow">
                          {inst.step}
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-base mb-1">
                            {inst.title}
                          </p>
                          {inst.hasDescription && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {inst.description}
                            </p>
                          )}
                          {inst.needsTime && inst.duration && (
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <p className="text-sm text-purple-600 flex items-center gap-1">
                                <span>⏱️</span>
                                <span>{inst.duration}</span>
                                {completedTimers.has(inst.step) ? (
                                  <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                                    ✓ Đã hoàn thành
                                  </span>
                                ) : activeTimers[inst.step] && (() => {
                                  const remaining = Math.floor((activeTimers[inst.step].endTime - Date.now()) / 1000);
                                  return remaining > 0 ? (
                                    <span className="ml-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                                      Đang chạy
                                    </span>
                                  ) : null;
                                })()}
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => router.push(`/cook/${recipeId}/steps/${inst.step}`)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2 w-full text-left"
                          >
                            ← Xem lại
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Preview Next Steps - Always show if there are next steps */}
          {instructions.some((inst) => inst.step > stepNumber) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-2xl">👀</span>
                <span>Các bước tiếp theo</span>
              </h3>
              
              <div className="space-y-3">
                  {instructions
                    .filter((inst) => inst.step > stepNumber)
                    .map((inst) => (
                      <div 
                        key={inst.id} 
                        className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          {/* Step Number Badge */}
                          <div className="flex-shrink-0 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-base shadow">
                            {inst.step}
                          </div>
                          
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-base mb-1">
                              {inst.title}
                            </p>
                            {inst.hasDescription && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {inst.description}
                              </p>
                            )}
                            {inst.needsTime && inst.duration && (
                              <div className="flex items-center justify-between gap-2 mt-2">
                                <p className="text-sm text-yellow-700 flex items-center gap-1">
                                  <span>⏱️</span>
                                  <span>{inst.duration}</span>
                                  {completedTimers.has(inst.step) ? (
                                    <span className="ml-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                                      ✓ Đã hoàn thành
                                    </span>
                                  ) : activeTimers[inst.step] && (() => {
                                    const remaining = Math.floor((activeTimers[inst.step].endTime - Date.now()) / 1000);
                                    return remaining > 0 ? (
                                      <span className="ml-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                                        Đang chạy
                                      </span>
                                    ) : null;
                                  })()}
                                </p>
                                {!activeTimers[inst.step] && !completedTimers.has(inst.step) && (
                                  <button
                                    onClick={() => startTimerForStep(inst.step, inst.duration!)}
                                    className="bg-yellow-500 text-white text-sm font-semibold py-1 px-2 rounded hover:bg-yellow-600 transition-colors"
                                  >
                                    ▶ Start
                                  </button>
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => router.push(`/cook/${recipeId}/steps/${inst.step}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 w-full text-left"
                            >
                              Đi tới →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
    </PageContainer>
  );
}

export default function StepPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <StepPageContent />
    </Suspense>
  );
}
