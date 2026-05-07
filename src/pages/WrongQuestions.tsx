import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, BookOpen, Trash2, ChevronRight, X, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QUESTION_BANK } from '../data/questions';
import { Question, QuestionType } from '../types';
import { cn } from '../lib/utils';

export function WrongQuestions() {
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('psa_wrong_questions') || '[]');
    setWrongIds(saved);
  }, []);

  const wrongQuestions = useMemo(() => {
    return QUESTION_BANK.filter(q => wrongIds.includes(q.id));
  }, [wrongIds]);

  const filteredQuestions = useMemo(() => {
    return wrongQuestions.filter(q => 
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.chapter.toLowerCase().includes(search.toLowerCase())
    );
  }, [wrongQuestions, search]);

  const removeWrong = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = wrongIds.filter(wid => wid !== id);
    setWrongIds(next);
    localStorage.setItem('psa_wrong_questions', JSON.stringify(next));
  };

  const clearAll = () => {
    if (window.confirm('确认清空所有错题记录吗？')) {
      setWrongIds([]);
      localStorage.removeItem('psa_wrong_questions');
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 font-sans min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-rose-500 mb-2">
             <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                <BookOpen size={20} className="fill-current" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Learning Excellence</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            错题精选集 
            <span className="text-xs font-black bg-rose-50 text-rose-500 px-4 py-2 rounded-full border border-rose-100 shadow-sm">
               {wrongIds.length} ITEMS
            </span>
          </h2>
          <p className="text-slate-400 text-sm font-bold tracking-tight">系统自动追踪您的薄弱环节，为您提供个性化的复习深度建议。</p>
        </div>
        <div className="flex gap-4">
          {wrongIds.length > 0 && (
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#fef2f2' }}
              whileTap={{ scale: 0.98 }}
              onClick={clearAll}
              className="flex items-center gap-3 bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-rose-500 hover:border-rose-200 transition-all shadow-sm"
            >
              <Trash2 size={16} />
              清空训练库
            </motion.button>
          )}
        </div>
      </header>

      <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 group">
        <div className="relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-rose-500 transition-colors" />
          <input 
            type="text" 
            placeholder="搜索错题：关键词、故障类型、计算步骤..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:ring-8 focus:ring-rose-100 focus:border-rose-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 pb-24">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((q, i) => (
            <motion.div
              layout
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -30 }}
              whileHover={{ x: 8, borderColor: '#f43f5e', scale: 1.002 }}
              transition={{ duration: 0.3 }}
              onClick={() => setSelectedQuestion(q)}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all group flex items-center justify-between gap-8 cursor-pointer relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                     <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">
                        {q.type === QuestionType.SINGLE_CHOICE ? '单选' : q.type === QuestionType.MULTIPLE_CHOICE ? '多选' : '判断'}
                     </span>
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        {q.chapter}
                     </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-relaxed tracking-tight group-hover:text-rose-600 transition-colors">
                     {q.text}
                  </h3>
               </div>
               <div className="flex items-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.2, color: '#f43f5e' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => removeWrong(q.id, e)}
                    className="p-4 text-slate-200 rounded-2xl transition-all hover:bg-rose-50 hover:shadow-inner"
                    title="移出记录"
                  >
                     <Trash2 size={20} />
                  </motion.button>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 group-hover:scale-110 transition-all shrink-0 shadow-sm">
                     <ChevronRight size={24} />
                  </div>
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredQuestions.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <BookOpen size={40} />
            </div>
            <p className="text-slate-400 font-bold">暂无相关错题记录</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] w-full max-w-2xl relative z-10 p-8 shadow-2xl border border-slate-200"
            >
               <motion.button 
                 whileHover={{ scale: 1.1, rotate: 90 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={() => setSelectedQuestion(null)}
                 className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
               >
                 <X size={20} />
               </motion.button>

               <div className="mb-6 flex gap-2">
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded border border-blue-100">
                    {selectedQuestion.type}
                 </span>
                 <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded border border-slate-100">
                    {selectedQuestion.chapter}
                 </span>
               </div>

               <h2 className="text-xl font-bold text-slate-900 leading-relaxed mb-8">
                  {selectedQuestion.text}
               </h2>

               <div className="space-y-3 mb-8">
                  {selectedQuestion.options?.map((opt, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm font-bold text-slate-700 flex items-center gap-4">
                       <span className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-black text-slate-400 border border-slate-200">
                          {String.fromCharCode(65 + i)}
                       </span>
                       {opt}
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-2 mb-3 text-red-800 font-black text-[10px] uppercase tracking-widest">
                     <FileText size={14} />
                     精选解析 (ANALYSIS)
                  </div>
                  <p className="text-red-900 text-sm font-bold mb-2">
                    正确答案: <span className="text-emerald-600">{Array.isArray(selectedQuestion.correctAnswer) ? selectedQuestion.correctAnswer.join(', ') : selectedQuestion.correctAnswer}</span>
                  </p>
                  <p className="text-red-700 text-xs leading-relaxed italic">
                    {selectedQuestion.explanation}
                  </p>
               </div>

               <div className="mt-8 flex justify-end">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => removeWrong(selectedQuestion.id)}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                  >
                    <CheckCircle2 size={18} />
                    标记为已掌握
                  </motion.button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
