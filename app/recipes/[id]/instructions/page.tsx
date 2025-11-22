'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui';
import { RecipeService } from '@/libs/recipeService';

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
  hasVoiceNote?: boolean;
  tags?: string[];
  isSimpleStep?: boolean;
}

interface Recipe {
  id: string;
  dishName?: string;
  recipeName?: string;
  sameAsdish?: boolean;
  difficulty?: string;
  cookingTime?: string;
  estimateTime?: boolean;
  estimatedTime?: string;
  instructor?: string;
  description?: string;
  ingredientsList?: Array<{ name: string; quantity: string; unit: string }>;
  favoriteBrands?: string[];
  specialNotes?: string;
  instructions?: string;
  tips?: string;
  createdAt: string;
}

export default function InstructionsPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = params.id as string;
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [hasTips, setHasTips] = useState(false);
  const [tips, setTips] = useState('');
  const [recordingStepId, setRecordingStepId] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceBlobs, setVoiceBlobs] = useState<Record<string, Blob | null>>({});
  const [voiceUrls, setVoiceUrls] = useState<Record<string, string | null>>({});
  const [micError, setMicError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'manual' | 'voice'>('manual');
  const [voiceTargetId, setVoiceTargetId] = useState<string | null>(null);
  const [voiceMode, setVoiceMode] = useState<'perStep' | 'full'>('perStep');
  const voiceLang = (process.env.NEXT_PUBLIC_STT_LANG as 'Eng' | 'Vi') || 'Vi';
  const [recordingMode, setRecordingMode] = useState<'none' | 'step' | 'full'>('none');
  const [fullRecordingBlob, setFullRecordingBlob] = useState<Blob | null>(null);
  const [fullRecordingUrl, setFullRecordingUrl] = useState<string | null>(null);
  const [uploadingFull, setUploadingFull] = useState(false);
  const [fullUploadUrl, setFullUploadUrl] = useState<string | null>(null);
  const [fullUploadError, setFullUploadError] = useState<string | null>(null);
  const [transcribingSteps, setTranscribingSteps] = useState<Record<string, boolean>>({});
  const [stepVoiceErrors, setStepVoiceErrors] = useState<Record<string, string | null>>({});
  const [analyzingLong, setAnalyzingLong] = useState(false);
  const [longAnalysisError, setLongAnalysisError] = useState<string | null>(null);
  const [pendingLongTranscript, setPendingLongTranscript] = useState('');
  const [pendingLongTips, setPendingLongTips] = useState('');
  const [splittingLong, setSplittingLong] = useState(false);
  const [splitError, setSplitError] = useState<string | null>(null);

  useEffect(() => {
    // Load recipe from RecipeService (Firestore with localStorage fallback)
    const loadRecipe = async () => {
      const found = await RecipeService.getById(recipeId);
      if (found) {
        setRecipe(found);
        // Parse instructions if they exist
        if (found.instructions) {
          try {
            setInstructions(JSON.parse(found.instructions));
          } catch {
            // If not JSON, treat as plain text
            setInstructions([
              {
                id: '1',
                step: 1,
                title: '',
                description: found.instructions,
              },
            ]);
          }
        }
        // Load tips
        setTips(found.tips || '');
        setHasTips(!!found.tips);
      }
      setLoading(false);
    };

    loadRecipe();
  }, [recipeId]);

  useEffect(() => {
    if (instructions.length > 0) {
      setVoiceTargetId(prev => {
        if (prev && instructions.find(i => i.id === prev)) {
          return prev;
        }
        return instructions[instructions.length - 1].id;
      });
    } else {
      setVoiceTargetId(null);
    }
  }, [instructions]);

  const addInstruction = () => {
    const newId = Date.now().toString();
    setInstructions(prev => [
      ...prev,
      {
        id: newId,
        step: prev.length + 1,
        title: '',
        hasDescription: false,
        description: '',
        needsTime: false,
        duration: '',
        hasNote: false,
        note: '',
        hasVoiceNote: false,
        isSimpleStep: false,
      },
    ]);
  };

  const removeInstruction = (id: string) => {
    const updated = instructions.filter(ing => ing.id !== id);
    // Reorder steps
    setInstructions(updated.map((ing, idx) => ({ ...ing, step: idx + 1 })));
  };

  const updateInstruction = (id: string, field: keyof Instruction, value: string | boolean) => {
    setInstructions(instructions.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const startRecording = async (stepId: string) => {
    if (recordingMode !== 'none') return; // Đang ghi
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceBlobs(prev => ({ ...prev, [stepId]: blob }));

        setVoiceUrls(prev => {
          if (prev[stepId]) URL.revokeObjectURL(prev[stepId] as string);
          return { ...prev, [stepId]: URL.createObjectURL(blob) };
        });

        transcribeStepAudio(stepId, blob);

        recorder.stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
        setRecordingStepId(null);
        setRecordingMode('none');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingStepId(stepId);
      setRecordingMode('step');
    } catch (error: any) {
      console.error('Mic error:', error);
      setMicError('Không truy cập được micro. Kiểm tra quyền truy cập.');
      setMediaRecorder(null);
      setRecordingStepId(null);
      setRecordingMode('none');
    }
  };

  const stopRecording = () => {
    if (recordingMode === 'step' && mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const createStepAndRecord = () => {
    if (recordingMode !== 'none') return;
    const newId = Date.now().toString();
    setInstructions(prev => [
      ...prev,
      {
        id: newId,
        step: prev.length + 1,
        title: '',
        hasDescription: false,
        description: '',
        needsTime: false,
        duration: '',
        hasNote: false,
        note: '',
        hasVoiceNote: true,
      },
    ]);
    setVoiceTargetId(newId);
    startRecording(newId);
  };

  const startFullRecording = async () => {
    if (recordingMode !== 'none') return;
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setFullRecordingBlob(blob);
        setFullRecordingUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(blob);
        });

        uploadFullAudio(blob);

        recorder.stream.getTracks().forEach(track => track.stop());
        setMediaRecorder(null);
        setRecordingMode('none');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingMode('full');
    } catch (error: any) {
      console.error('Mic error:', error);
      setMicError('Không truy cập được micro. Kiểm tra quyền truy cập.');
      setMediaRecorder(null);
      setRecordingMode('none');
    }
  };

  const stopFullRecording = () => {
    if (recordingMode === 'full' && mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const uploadFullAudio = async (blob: Blob) => {
    setUploadingFull(true);
    setFullUploadError(null);
    try {
      const fd = new FormData();
      fd.append(
        'file',
        new File([blob], 'voice.webm', {
          type: 'audio/webm',
        })
      );
      fd.append('userId', recipeId || 'anonymous');
      const res = await fetch('/api/upload/audio', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      setFullUploadUrl(data.audioUrl || null);
    } catch (err: any) {
      setFullUploadError(err.message || 'Upload failed');
    } finally {
      setUploadingFull(false);
    }
  };

  const transcribeStepAudio = async (stepId: string, blob: Blob) => {
    setTranscribingSteps(prev => ({ ...prev, [stepId]: true }));
    setStepVoiceErrors(prev => ({ ...prev, [stepId]: null }));
    try {
      const formData = new FormData();
      formData.append(
        'file',
        new File([blob], 'step-voice.webm', {
          type: blob.type || 'audio/webm',
        })
      );
      formData.append('lang', voiceLang);

      const res = await fetch('/api/naver/stt', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Transcription failed');
      }

      const newText = (data.text || '').trim();
      if (!newText) {
        setStepVoiceErrors(prev => ({
          ...prev,
          [stepId]: 'Không nhận được nội dung. Vui lòng ghi lại gần micro hơn.',
        }));
        return;
      }

      try {
        const analyzeRes = await fetch('/api/clova/steps/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newText }),
        });
        const analyzeData = await analyzeRes.json();
        if (!analyzeRes.ok) {
          throw new Error(analyzeData.error || 'Analyze failed');
        }

        const aiAction = (analyzeData.action || '').trim();
        const aiDuration = (analyzeData.duration || '').trim();
        const aiNote = (analyzeData.note || newText || '').trim();

        setInstructions(prev =>
          prev.map(instruction =>
            instruction.id === stepId
              ? {
                  ...instruction,
                  title:
                    aiAction ||
                    newText ||
                    instruction.title ||
                    `Bước ${instruction.step}`,
                  needsTime: aiDuration ? true : instruction.needsTime,
                  duration: aiDuration || instruction.duration || '',
                  hasNote: true,
                  note: aiNote,
                }
              : instruction
          )
        );
      } catch (analysisError: any) {
        console.error('Clova analyze error:', analysisError);
        setInstructions(prev =>
          prev.map(instruction =>
            instruction.id === stepId
              ? {
                  ...instruction,
                  hasNote: true,
                  note: `${(instruction.note || '').trim()} ${newText}`.trim(),
                }
              : instruction
          )
        );
        throw analysisError;
      }
    } catch (err: any) {
      setStepVoiceErrors(prev => ({ ...prev, [stepId]: err.message || 'Transcription failed' }));
    } finally {
      setTranscribingSteps(prev => ({ ...prev, [stepId]: false }));
    }
  };

  const handleAnalyzeLongRecording = async () => {
    if (!fullUploadUrl) return;
    setAnalyzingLong(true);
    setLongAnalysisError(null);
      setPendingLongTranscript('');
      setPendingLongTips('');
    try {
      const res = await fetch('/api/naver/stt/long', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: fullUploadUrl,
          lang: voiceLang,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Phân tích thất bại');
      }

      const rawSteps = Array.isArray(data.steps)
        ? data.steps
        : Array.isArray(data.cach_lam)
          ? data.cach_lam
          : [];

      const normalizedSteps = rawSteps.length
        ? rawSteps.map((step: any) =>
            typeof step === 'string'
              ? step
              : [step.title, step.description, step.note].filter(Boolean).join('. ')
          )
        : (data.text ? [data.text] : []);

      setPendingLongTranscript(normalizedSteps.join('\n\n'));
      setPendingLongTips(data.overallNote || data.bi_kip || '');
    } catch (error: any) {
      setLongAnalysisError(error.message || 'Phân tích thất bại');
    } finally {
      setAnalyzingLong(false);
    }
  };

  const handleSplitTranscript = () => {
    if (!pendingLongTranscript.trim()) {
      setSplitError('Không có nội dung để phân tách');
      return;
    }
    setSplitError(null);
    const segments = pendingLongTranscript
      .split(/\n{2,}/)
      .map(segment => segment.trim())
      .filter(Boolean);

    if (!segments.length) {
      setSplitError('Không tìm thấy câu nào hợp lệ để phân tách');
      return;
    }

    const base = instructions.length;
    const mapped = segments.map((segment, idx) => ({
      id: `${Date.now()}-${idx}`,
      step: base + idx + 1,
      title: segment,
      hasDescription: false,
      description: '',
      needsTime: false,
      duration: '',
      hasNote: false,
      note: '',
      hasVoiceNote: false,
      isSimpleStep: true,
    }));

    setInstructions(prev => [...prev, ...mapped]);
    if (pendingLongTips) {
      setHasTips(true);
      setTips(pendingLongTips);
    }
    setPendingLongTranscript('');
    setPendingLongTips('');
  };

  const handleKeepTranscript = () => {
    if (!pendingLongTranscript.trim()) {
      setSplitError('Không có nội dung để lưu');
      return;
    }
    setHasTips(true);
    setTips(prev => prev ? `${prev}\n\n${pendingLongTranscript}` : pendingLongTranscript);
    setPendingLongTranscript('');
    setSplitError(null);
  };


  const handleSaveAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with instructions and tips using RecipeService
    try {
      await RecipeService.update(recipeId, {
        instructions: JSON.stringify(instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim()))),
        tips: hasTips ? tips : '',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}`);
  };

  const handleContinueToGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update recipe with instructions and tips using RecipeService
    try {
      await RecipeService.update(recipeId, {
        instructions: JSON.stringify(instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim()))),
        tips: hasTips ? tips : '',
      });
    } catch (error) {
      console.error('Error updating recipe:', error);
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push(`/recipes/${recipeId}/gallery`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy công thức</p>
          <button
            onClick={() => router.push('/recipes')}
            className="px-6 py-3 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 p-8">
          <div className="mb-8 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {recipe.dishName || recipe.recipeName || 'Công thức'}
              </h2>
              <p className="text-gray-600">
                Nhập các bước nấu từng bước một
              </p>
            </div>
            <div className="flex gap-3 bg-orange-50 border border-orange-200 rounded-full p-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-700 hover:bg-orange-100'
                }`}
              >
                Nhập thủ công
              </button>
              <button
                type="button"
                onClick={() => setInputMode('voice')}
                className={`px-4 py-2 text-sm sm:text-base font-semibold rounded-full transition-colors ${
                  inputMode === 'voice'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-700 hover:bg-orange-100'
                }`}
              >
                Nhập bằng giọng nói
              </button>
            </div>
          </div>

          {inputMode === 'voice' && (
            <div className="mb-6 p-4 border-2 border-orange-200 rounded-xl bg-orange-50/60 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-800">Nhập bằng giọng nói</p>
                  <p className="text-sm text-gray-700">
                    Chọn chế độ ghi âm phù hợp, sau đó bắt đầu thu âm.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-orange-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceMode === 'perStep'}
                      onChange={() => setVoiceMode('perStep')}
                      className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                      style={{
                        backgroundImage: voiceMode === 'perStep'
                          ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                          : 'none'
                      }}
                    />
                    Ghi âm theo từng bước
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-orange-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceMode === 'full'}
                      onChange={() => setVoiceMode('full')}
                      className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                      style={{
                        backgroundImage: voiceMode === 'full'
                          ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                          : 'none'
                      }}
                    />
                    Ghi âm toàn bộ
                  </label>
                </div>
              </div>

              {voiceMode === 'perStep' && (
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
                  <div>
                    {instructions.length > 0 && (
                      <>
                        {recordingMode === 'step' && recordingStepId === voiceTargetId ? (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-semibold"
                          >
                            Dừng ghi âm bước hiện tại
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const targetId = voiceTargetId || instructions[instructions.length - 1].id;
                              updateInstruction(targetId, 'hasVoiceNote', true);
                              startRecording(targetId);
                            }}
                            disabled={recordingMode !== 'none'}
                            className="px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 rounded-lg font-semibold disabled:opacity-50"
                          >
                            Ghi tiếp bước hiện tại
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={createStepAndRecord}
                    disabled={recordingMode !== 'none'}
                    className="px-4 py-2 bg-orange-50 text-orange-700 border-2 border-orange-200 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {instructions.length === 0 ? 'Tạo bước đầu tiên & ghi' : 'Tạo bước mới & ghi tiếp'}
                  </button>
                </div>
              )}

              {voiceMode === 'full' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    {recordingMode === 'full' ? (
                      <button
                        type="button"
                        onClick={stopFullRecording}
                        className="px-4 py-2 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-semibold"
                      >
                        Dừng ghi âm toàn bộ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startFullRecording}
                        disabled={recordingMode !== 'none'}
                        className="px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Bắt đầu ghi âm toàn bộ
                      </button>
                    )}
                    {uploadingFull && <p className="text-sm text-gray-700">Đang tải lên lưu trữ...</p>}
                  </div>

                  {fullUploadUrl && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                      Đã lưu
                    </div>
                  )}

                  {fullUploadError && (
                    <p className="text-sm text-red-600">{fullUploadError}</p>
                  )}
                  {longAnalysisError && (
                    <p className="text-sm text-red-600">{longAnalysisError}</p>
                  )}

                  {pendingLongTranscript ? (
                    <div className="bg-white border border-orange-200 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-semibold text-orange-800">
                        Nội dung đã ghi
                      </p>
                      <textarea
                        value={pendingLongTranscript}
                        onChange={(e) => setPendingLongTranscript(e.target.value)}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                        placeholder="Nội dung đã ghi sẽ xuất hiện ở đây..."
                      />
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSplitTranscript}
                          className="px-4 py-3 flex-1 bg-blue-100 border-2 border-blue-200 rounded-xl text-blue-700 font-semibold hover:bg-blue-200"
                        >
                          Phân tách công thức thành từng bước text
                        </button>
                        <button
                          type="button"
                          onClick={handleKeepTranscript}
                          className="px-4 py-3 flex-1 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 font-semibold hover:bg-green-100"
                        >
                          Giữ dưới dạng ghi chú
                        </button>
                      </div>
                      {splitError && (
                        <p className="text-sm text-red-600">{splitError}</p>
                      )}
                    </div>
                  ) : (
                    fullUploadUrl && (
                      <button
                        type="button"
                        onClick={handleAnalyzeLongRecording}
                        disabled={analyzingLong}
                        className="w-full px-4 py-3 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-xl font-semibold disabled:opacity-50"
                      >
                        {analyzingLong ? 'Đang phân tích...' : 'Phân tích & lấy nội dung'}
                      </button>
                    )
                  )}
                </div>
              )}
              {micError && <p className="mt-2 text-sm text-red-600">{micError}</p>}
            </div>
          )}

          <form className="space-y-6">
            {/* Instructions List */}
            <div>
              <label className="block text-sm font-semibold text-orange-700 mb-4">
                Các bước nấu
              </label>

              {instructions.length === 0 ? (
                <p className="text-sm text-gray-500 mb-4">Chưa có bước nấu nào. Hãy thêm bước đầu tiên.</p>
              ) : (
                <div className="space-y-4 mb-4">
                  {instructions.map((instruction) => (
                    <div key={instruction.id} className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50/40">
                      <div className="flex gap-3 items-start mb-3">
                        <div className="text-sm font-semibold text-white bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 pt-0.5">
                          {instruction.step}
                        </div>
                        <input
                          type="text"
                          value={instruction.title}
                          onChange={(e) => updateInstruction(instruction.id, 'title', e.target.value)}
                          placeholder="Tiêu đề bước này (VD: Chuẩn bị nguyên liệu)"
                          className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent font-semibold text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeInstruction(instruction.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-200 rounded-lg transition-colors text-sm font-semibold flex-shrink-0"
                        >
                          Xóa
                        </button>
                      </div>

                      {!instruction.isSimpleStep && (
                        <>
                          {/* Time checkbox and input */}
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                id={`time-${instruction.id}`}
                                checked={instruction.needsTime || false}
                                onChange={(e) => updateInstruction(instruction.id, 'needsTime', e.target.checked)}
                                className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                                style={{
                                  backgroundImage: instruction.needsTime
                                    ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                                    : 'none'
                                }}
                              />
                              <label htmlFor={`time-${instruction.id}`} className="text-sm text-orange-700 cursor-pointer font-semibold">
                                Cần thời gian chính xác
                              </label>
                            </div>

                            {instruction.needsTime && (
                              <input
                                type="text"
                                value={instruction.duration || ''}
                                onChange={(e) => updateInstruction(instruction.id, 'duration', e.target.value)}
                                placeholder="VD: 10 phút, 30 giây, 2 giờ..."
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              />
                            )}
                          </div>

                          {/* Note checkbox and input */}
                          <div className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <input
                                type="checkbox"
                                id={`note-${instruction.id}`}
                                checked={instruction.hasNote || false}
                                onChange={(e) => updateInstruction(instruction.id, 'hasNote', e.target.checked)}
                                className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                                style={{
                                  backgroundImage: instruction.hasNote
                                    ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                                    : 'none'
                                }}
                              />
                              <label htmlFor={`note-${instruction.id}`} className="text-sm text-orange-700 cursor-pointer font-semibold">
                                Lưu ý
                              </label>
                            </div>

                            {instruction.hasNote && (
                              <textarea
                                value={instruction.note || ''}
                                onChange={(e) => updateInstruction(instruction.id, 'note', e.target.value)}
                                placeholder="VD: Không nên xáo quá kỹ, thêm muối vào cuối..."
                                rows={2}
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus-border-transparent text-sm resize-none"
                              />
                            )}
                          </div>

                          {/* Voice note shortcut */}
                          <div className="mt-3 space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                recordingStepId === instruction.id
                                  ? stopRecording()
                                  : startRecording(instruction.id)
                              }
                              className={`px-3 py-2 border-2 rounded-lg font-semibold transition-colors ${
                                recordingStepId === instruction.id
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-green-50 text-green-700 border-green-200'
                              } disabled:opacity-50`}
                              disabled={!!recordingStepId && recordingStepId !== instruction.id}
                            >
                              {recordingStepId === instruction.id ? 'Đang ghi... Nhấn để dừng' : 'Ghi bằng giọng nói'}
                            </button>
                            {transcribingSteps[instruction.id] && (
                              <p className="text-sm text-blue-700">Đang chuyển giọng nói thành text...</p>
                            )}
                            {stepVoiceErrors[instruction.id] && (
                              <p className="text-sm text-red-600">{stepVoiceErrors[instruction.id]}</p>
                            )}
                            {micError && (
                              <p className="text-sm text-red-600">{micError}</p>
                            )}
                          </div>
                        </>
                      )}
                </div>
              ))}
            </div>
          )}

        <button
          type="button"
          onClick={() => addInstruction()}
          className="w-full py-3 px-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-700 font-bold hover:bg-orange-50 transition-colors"
        >
          Thêm bước nấu
        </button>
            </div>

            {/* Special Notes from Instructor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="hasTips"
                  checked={hasTips}
                  onChange={(e) => setHasTips(e.target.checked)}
                  className="appearance-none w-5 h-5 bg-orange-50 border-2 border-orange-300 rounded-full focus:outline-none transition-all cursor-pointer hover:border-orange-400 checked:border-orange-500"
                  style={{
                    backgroundImage: hasTips
                      ? 'radial-gradient(circle, #f97316 35%, transparent 35%)'
                      : 'none'
                  }}
                />
                <label htmlFor="hasTips" className="text-sm font-semibold text-orange-700 cursor-pointer">
                  Có lưu ý đặc biệt (bí kíp) từ người hướng dẫn
                </label>
              </div>

              {hasTips && (
                <textarea
                  value={tips}
                  onChange={(e) => setTips(e.target.value)}
                  placeholder="Nhập lưu ý đặc biệt, mẹo nấu, hoặc những điều cần chú ý từ người hướng dẫn..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-6">
              <button
                onClick={handleContinueToGallery}
                disabled={saving || instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim())).length === 0}
                className="w-full p-4 bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 rounded-xl transition-all hover:scale-[1.02] font-bold text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu và thêm hình ảnh'}
              </button>
              <button
                onClick={handleSaveAndContinue}
                disabled={saving || instructions.filter(ing => ing.title.trim() || (ing.note && ing.note.trim())).length === 0}
                className="w-full p-3 bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 rounded-xl transition-all hover:scale-[1.02] font-bold text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu và quay lại'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
