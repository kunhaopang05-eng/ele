import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Clock, Send, ChevronLeft, ChevronRight, FileDown, CheckCircle2, AlertCircle, Bookmark, Share2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTION_BANK } from '../data/questions';
import { Question, QuestionType } from '../types';
import { cn } from '../lib/utils';
import { exportExamToWord } from '../lib/exportUtils';

export function ExamSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Load bookmarks
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('psa_bookmarks') || '[]');
    setBookmarks(saved);
  }, []);

  const toggleBookmark = (id: string) => {
    const next = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id) 
      : [...bookmarks, id];
    setBookmarks(next);
    localStorage.setItem('psa_bookmarks', JSON.stringify(next));
  };

  const handleShare = () => {
    const text = `我正在练习《电力系统分析》，目前的进度是 ${currentIdx + 1}/${questions.length}。一起来学习吧！`;
    if (navigator.share) {
      navigator.share({ title: '考试分享', text, url: window.location.href }).catch(() => {});
    } else {
      alert(`分享内容：\n${text}\n\n(浏览器暂不支持原生分享，已复制到剪贴板)`);
      navigator.clipboard.writeText(text);
    }
  };

  // Randomly select questions based on config
  const questions = useMemo(() => {
    if (!config) return QUESTION_BANK.slice(0, 5);
    
    const pool = QUESTION_BANK.filter(q => config.selectedChapters.includes(q.chapter));
    
    const singles = pool.filter(q => q.type === QuestionType.SINGLE_CHOICE).sort(() => Math.random() - 0.5).slice(0, config.singleCount);
    const multiples = pool.filter(q => q.type === QuestionType.MULTIPLE_CHOICE).sort(() => Math.random() - 0.5).slice(0, config.multipleCount);
    const binaries = pool.filter(q => q.type === QuestionType.TRUE_FALSE).sort(() => Math.random() - 0.5).slice(0, config.binaryCount);
    
    return [...singles, ...multiples, ...binaries];
  }, [config]);

  useEffect(() => {
    if (!config) return;
    const totalMinutes = questions.length * 2;
    setTimeLeft(totalMinutes * 60);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [questions, config]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIdx];

  const handleAnswerChange = (qId: string, answer: any) => {
    if (isFinished) return;

    if (currentQuestion.type === QuestionType.MULTIPLE_CHOICE) {
      const currentArr = (answers[qId] as string[]) || [];
      const nextArr = currentArr.includes(answer)
        ? currentArr.filter(a => a !== answer)
        : [...currentArr, answer].sort();
      setAnswers({ ...answers, [qId]: nextArr });
    } else {
      setAnswers({ ...answers, [qId]: answer });
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const userAns = answers[q.id];
      if (Array.isArray(q.correctAnswer)) {
        if (JSON.stringify((userAns || []).sort()) === JSON.stringify(q.correctAnswer.sort())) {
          correct++;
        }
      } else {
        if (userAns === q.correctAnswer) {
          correct++;
        }
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const score = isFinished ? calculateScore() : 0;

  useEffect(() => {
    if (isFinished && score !== undefined) {
      const history = JSON.parse(localStorage.getItem('psa_exam_history') || '[]');
      const newRecord = {
        id: Date.now().toString(),
        title: config?.title || '在线专业测试',
        score,
        date: new Date().toISOString(),
        correctCount: Math.round((score / 100) * questions.length),
        totalCount: questions.length,
        chapters: config?.selectedChapters || []
      };
      localStorage.setItem('psa_exam_history', JSON.stringify([newRecord, ...history]));

      // Record wrong questions
      const wrongIds = questions
        .filter((q) => {
          const userAns = answers[q.id];
          if (Array.isArray(q.correctAnswer)) {
            return JSON.stringify((userAns || []).sort()) !== JSON.stringify(q.correctAnswer.sort());
          }
          return userAns !== q.correctAnswer;
        })
        .map(q => q.id);

      if (wrongIds.length > 0) {
        const existingWrongs = JSON.parse(localStorage.getItem('psa_wrong_questions') || '[]');
        const updatedWrongs = Array.from(new Set([...existingWrongs, ...wrongIds]));
        localStorage.setItem('psa_wrong_questions', JSON.stringify(updatedWrongs));
      }
    }
  }, [isFinished, score, config, questions, answers]);

  if (!questions.length) return <div>No questions found for this config.</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400 hover:text-slate-900"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight">{config?.title || '在线专业测试'}</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">共 {questions.length} 题 · 当前第 {currentIdx + 1} 题</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl border border-white/5">
            <Clock size={16} className="text-blue-400" />
            <span className="font-mono font-bold tracking-tighter text-lg leading-none">{formatTime(timeLeft)}</span>
          </div>
          {!isFinished && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFinished(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/10"
            >
              提交试卷
              <Send size={16} />
            </motion.button>
          )}
          {isFinished && (
            <div className="flex gap-2">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => exportExamToWord(config?.title || '试卷', questions, false)}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-slate-50 text-xs"
              >
                <FileDown size={16} />
                导出试卷
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => exportExamToWord(`${(config?.title || '试卷')} - 答案`, questions, true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/10 text-xs"
              >
                <FileDown size={16} />
                导出答案
              </motion.button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex">
        {/* Left: Question Navigation */}
        <aside className="w-80 bg-white border-r border-slate-200 p-8 overflow-y-auto hidden lg:block">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">答题进度导航</h3>
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isCurrent = currentIdx === i;
              const isCorrect = isFinished && (
                Array.isArray(q.correctAnswer) 
                  ? JSON.stringify((answers[q.id] || []).sort()) === JSON.stringify(q.correctAnswer.sort())
                  : answers[q.id] === q.correctAnswer
              );

              return (
                <motion.button
                  key={q.id}
                  whileHover={{ scale: 1.1, zIndex: 30 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentIdx(i)}
                  className={cn(
                    "aspect-square w-full rounded-lg flex items-center justify-center font-bold text-xs transition-all border",
                    isCurrent ? "border-blue-600 ring-4 ring-blue-50 z-10 scale-105" : "border-slate-100",
                    isFinished 
                      ? (isCorrect ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200")
                      : (isAnswered ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 hover:border-slate-300")
                  )}
                >
                  {i + 1}
                </motion.button>
              );
            })}
          </div>

          {isFinished && (
             <div className="mt-12 p-8 bg-slate-900 rounded-2xl text-white relative overflow-hidden">
                <div className="relative z-10 text-center">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-4">考试总分</p>
                  <div className="text-6xl font-light text-white mb-6">{score}</div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mb-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      className="bg-blue-500 h-full" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                    Performance Insight: {score >= 90 ? 'Excellent' : score >= 80 ? 'Superior' : score >= 60 ? 'Standard' : 'Needs Review'}
                  </p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
             </div>
          )}
        </aside>

        {/* Center: Question Display */}
        <div className="flex-1 overflow-y-auto py-12 px-8 flex justify-center">
          <div className="max-w-3xl w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
                   <div className="flex gap-2 mb-8">
                      <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-200">
                        {currentQuestion.chapter}
                      </span>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest rounded border border-blue-100">
                        Difficulty: {currentQuestion.difficulty}
                      </span>
                   </div>

                   <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-12">
                      <span className="text-blue-600 mr-4">Q{currentIdx + 1}.</span>
                      {currentQuestion.text}
                   </h2>

                   <div className="space-y-4">
                     {currentQuestion.type === QuestionType.TRUE_FALSE ? (
                        ['true', 'false'].map((opt) => (
                          <motion.button
                            key={opt}
                            whileHover={isFinished ? {} : { scale: 1.01 }}
                            whileTap={isFinished ? {} : { scale: 0.99 }}
                            disabled={isFinished}
                            onClick={() => handleAnswerChange(currentQuestion.id, opt)}
                            className={cn(
                                "w-full p-6 rounded-xl text-left transition-all flex items-center justify-between border-2",
                                answers[currentQuestion.id] === opt 
                                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                                    : "border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200"
                            )}
                          >
                            <span className="font-bold text-sm">{opt === 'true' ? '正确 (CORRECT)' : '错误 (INCORRECT)'}</span>
                            <div className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                answers[currentQuestion.id] === opt ? "bg-blue-600 border-blue-600" : "border-slate-300"
                            )}>
                                {answers[currentQuestion.id] === opt && <Zap className="w-3 h-3 text-white fill-current" />}
                            </div>
                          </motion.button>
                        ))
                     ) : (
                        currentQuestion.options?.map((opt, i) => {
                          const label = String.fromCharCode(65 + i);
                          const isSelected = Array.isArray(answers[currentQuestion.id]) 
                            ? answers[currentQuestion.id]?.includes(label)
                            : answers[currentQuestion.id] === label;

                          return (
                            <motion.button
                              key={label}
                              whileHover={isFinished ? {} : { scale: 1.01 }}
                              whileTap={isFinished ? {} : { scale: 0.99 }}
                              disabled={isFinished}
                              onClick={() => handleAnswerChange(currentQuestion.id, label)}
                              className={cn(
                                "w-full p-6 rounded-xl text-left transition-all flex items-center gap-6 border-2 group",
                                isSelected 
                                    ? "border-blue-600 bg-blue-50 text-blue-700" 
                                    : "border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200 shadow-sm"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black border-2 transition-all shrink-0",
                                isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-400 group-hover:border-blue-400"
                              )}>
                                {label}
                              </div>
                              <span className="flex-1 font-bold text-sm leading-relaxed">{opt}</span>
                            </motion.button>
                          );
                        })
                     )}
                   </div>

                   {isFinished && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 p-8 bg-slate-50 rounded-xl border border-slate-200"
                      >
                         <div className="flex items-center gap-3 mb-4 text-blue-800">
                            <CheckCircle2 size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest">专家解析 / EXPERT ANALYSIS</span>
                         </div>
                         <p className="text-slate-900 text-sm font-bold mb-4">
                            正确答案: <span className="text-emerald-600">{Array.isArray(currentQuestion.correctAnswer) ? currentQuestion.correctAnswer.join(', ') : (currentQuestion.type === QuestionType.TRUE_FALSE ? (currentQuestion.correctAnswer === 'true' ? '正确' : '错误') : currentQuestion.correctAnswer)}</span>
                         </p>
                         <p className="text-slate-600 text-sm leading-relaxed italic border-t border-slate-200 pt-4">
                            {currentQuestion.explanation}
                         </p>
                      </motion.div>
                   )}
                </div>

                <div className="flex justify-between items-center px-4">
                  <motion.button
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                    disabled={currentIdx === 0}
                    className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest disabled:opacity-20 hover:text-blue-600 transition-colors"
                  >
                    <ChevronLeft size={20} />
                    上一题
                  </motion.button>
                  <div className="flex gap-4">
                     <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleBookmark(currentQuestion.id)}
                        className={cn(
                          "p-3 border rounded-xl transition-all shadow-sm",
                          bookmarks.includes(currentQuestion.id) 
                            ? "bg-amber-50 border-amber-200 text-amber-500" 
                            : "bg-white border-slate-200 text-slate-400 hover:text-amber-500"
                        )}
                     >
                        <Bookmark size={20} fill={bookmarks.includes(currentQuestion.id) ? "currentColor" : "none"} />
                     </motion.button>
                     <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleShare}
                        className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm"
                     >
                        <Share2 size={20} />
                     </motion.button>
                  </div>
                  <motion.button
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIdx === questions.length - 1}
                    className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-widest disabled:opacity-20 hover:text-blue-600 transition-colors"
                  >
                    下一题
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
