import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Search, Filter, Book, BookOpen, ChevronRight, Zap, Target, Upload, FileText, Loader2, CheckCircle2, X } from 'lucide-react';
import { QUESTION_BANK } from '../data/questions';
import { CHAPTERS, QuestionType, Question } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function QuestionBank() {
  const [allQuestions, setAllQuestions] = useState<Question[]>(QUESTION_BANK);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('全部');
  const [selectedType, setSelectedType] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部');
  const [selectedTag, setSelectedTag] = useState('全部');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{ loading: boolean; progress: number; message: string }>({
    loading: false,
    progress: 0,
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allQuestions.forEach(q => q.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [allQuestions]);

  const filteredQuestions = useMemo(() => {
    const keywords = debouncedSearch.toLowerCase().split(/\s+/).filter(Boolean);
    
    return allQuestions.filter(q => {
      const matchSearch = keywords.length === 0 || keywords.every(kw => 
        q.text.toLowerCase().includes(kw) || 
        q.explanation.toLowerCase().includes(kw) ||
        q.chapter.toLowerCase().includes(kw)
      );
      
      const matchChapter = selectedChapter === '全部' || q.chapter === selectedChapter;
      const matchType = selectedType === '全部' || q.type === selectedType;
      const matchDifficulty = selectedDifficulty === '全部' || q.difficulty === selectedDifficulty;
      const matchTag = selectedTag === '全部' || q.tags?.includes(selectedTag);
      
      return matchSearch && matchChapter && matchType && matchDifficulty && matchTag;
    });
  }, [allQuestions, debouncedSearch, selectedChapter, selectedType, selectedDifficulty, selectedTag]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true, progress: 10, message: '正在分析文件格式...' });
    
    try {
      let extractedText = '';
      let importedList: Partial<Question>[] = [];

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        // Handle Excel/CSV
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);
        
        importedList = json.map((row, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          text: row.题目 || row.Question || row.text || Object.values(row)[0],
          options: [row.A, row.B, row.C, row.D].filter(Boolean),
          correctAnswer: String(row.答案 || row.Answer || row.correct || ''),
          chapter: row.章节 || '导入章节',
          type: (row.类型 === '多选' || row.type === 'multiple') ? QuestionType.MULTIPLE_CHOICE : 
                (row.类型 === '判断' || row.type === 'boolean') ? QuestionType.TRUE_FALSE : QuestionType.SINGLE_CHOICE,
          difficulty: 'intermediate',
          explanation: row.解析 || row.explanation || '自动导入解析'
        }));
      } else if (file.name.endsWith('.docx')) {
        // Handle Word
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        importedList = parseQuestionsFromText(extractedText);
      } else if (file.name.endsWith('.pdf')) {
        // Handle PDF
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        extractedText = fullText;
        importedList = parseQuestionsFromText(extractedText);
      } else {
        // Default to text parsing
        extractedText = await file.text();
        importedList = parseQuestionsFromText(extractedText);
      }

      if (importedList.length > 0) {
        const finalQuestions: Question[] = importedList.map((q, i) => ({
          id: q.id || `imp-${Date.now()}-${i}`,
          type: q.type || QuestionType.SINGLE_CHOICE,
          chapter: q.chapter || '智能导入',
          difficulty: q.difficulty || 'intermediate',
          text: q.text || '解析出的题目文本缺失',
          options: q.options || [],
          correctAnswer: q.correctAnswer || 'A',
          explanation: q.explanation || '智能解析生成的答案解析',
          tags: ['智能导入']
        }));

        setAllQuestions(prev => [...finalQuestions, ...prev]);
        setImportStatus({ loading: false, progress: 100, message: `成功导入 ${finalQuestions.length} 道题目！` });
        
        setTimeout(() => {
          setImportStatus(prev => ({ ...prev, message: '' }));
        }, 3000);
      } else {
        throw new Error('未能从文件中识别出有效的题目内容，请检查文件格式。');
      }

    } catch (err: any) {
      console.error(err);
      setImportStatus({ loading: false, progress: 0, message: `导入失败: ${err.message}` });
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <header className="h-20 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-blue-600">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <BookOpen size={20} className="fill-current" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 tracking-tight">智能题库探索</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Question Explorer</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
           {importStatus.message && (
             <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               className={cn(
                 "text-xs font-black px-4 py-2 rounded-xl flex items-center gap-2 border shadow-sm",
                 importStatus.message.includes('失败') ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
               )}
             >
               {importStatus.message.includes('失败') ? <X size={14} /> : <CheckCircle2 size={14} />}
               {importStatus.message}
             </motion.div>
           )}
           <motion.button 
             whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
             whileTap={{ scale: 0.98 }}
             onClick={() => fileInputRef.current?.click()}
             disabled={importStatus.loading}
             className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-xl shadow-blue-500/20"
           >
              {importStatus.loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              <span>{importStatus.loading ? '正在导入...' : '导入新题库'}</span>
           </motion.button>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileUpload} 
             className="hidden" 
             accept=".xlsx,.xls,.csv,.docx,.pdf,.txt"
           />
           <div className="flex items-center gap-3 bg-slate-900/5 px-4 py-2.5 rounded-xl border border-slate-200/50">
              <Target size={16} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">总量: <span className="text-slate-900">{allQuestions.length}</span></span>
           </div>
        </div>
      </header>

      <div className="p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto w-full">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 group transition-all hover:shadow-2xl hover:shadow-slate-200/50">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="键入关键词：对称分量法、变压器阻抗..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-50 rounded-[2rem] focus:ring-8 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl shadow-lg shadow-slate-900/10">
                <Filter size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">多维筛选</span>
             </div>
             
             {[
               { value: selectedChapter, onChange: setSelectedChapter, label: '所有章节 (CHAPTERS)', options: CHAPTERS.map(c => ({ value: c, label: c })) },
               { value: selectedType, onChange: setSelectedType, label: '所有题型 (TYPES)', options: [{ value: QuestionType.SINGLE_CHOICE, label: '单选题' }, { value: QuestionType.MULTIPLE_CHOICE, label: '多选题' }, { value: QuestionType.TRUE_FALSE, label: '判断题' }] },
               { value: selectedDifficulty, onChange: setSelectedDifficulty, label: '难度等级 (DIFFICULTY)', options: [{ value: 'basic', label: '基础 (BASIC)' }, { value: 'intermediate', label: '进阶 (INTERMEDIATE)' }, { value: 'advanced', label: '难点 (ADVANCED)' }] },
               { value: selectedTag, onChange: setSelectedTag, label: '知识标签 (TAGS)', options: allTags.map(t => ({ value: t, label: t })) },
             ].map((sel, idx) => (
               <select 
                 key={idx}
                 value={sel.value}
                 onChange={e => sel.onChange(e.target.value)}
                 className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-[0.1em] outline-none hover:border-blue-200 hover:bg-blue-50/10 transition-all cursor-pointer shadow-sm appearance-none"
               >
                  <option value="全部">{sel.label}</option>
                  {sel.options.map((o, i) => <option key={i} value={o.value}>{o.label}</option>)}
               </select>
             ))}

             {(search || selectedChapter !== '全部' || selectedDifficulty !== '全部' || selectedType !== '全部' || selectedTag !== '全部') && (
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: '#fee2e2' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearch('');
                    setSelectedChapter('全部');
                    setSelectedDifficulty('全部');
                    setSelectedType('全部');
                    setSelectedTag('全部');
                  }}
                  className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100 shadow-sm transition-all"
                >
                  重置筛选条件
                </motion.button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 pb-24">
          {filteredQuestions.slice(0, 50).map((q, i) => (
             <motion.div
               key={q.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               whileHover={{ x: 8, borderColor: '#3b82f6', scale: 1.002 }}
               whileTap={{ scale: 0.995 }}
               transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.5) }}
               layout
               onClick={() => setSelectedQuestion(q)}
               className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all group flex items-center justify-between gap-8 cursor-pointer relative overflow-hidden"
             >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                       <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border",
                          q.type === QuestionType.SINGLE_CHOICE ? "bg-blue-50 text-blue-600 border-blue-100" :
                          q.type === QuestionType.MULTIPLE_CHOICE ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                          "bg-amber-50 text-amber-600 border-amber-100"
                       )}>
                          {q.type === QuestionType.SINGLE_CHOICE ? '单选' : q.type === QuestionType.MULTIPLE_CHOICE ? '多选' : '判断'}
                       </span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{q.chapter}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 leading-relaxed text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                      {q.text}
                    </h3>
                    <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            q.difficulty === 'basic' ? "bg-emerald-400" : q.difficulty === 'intermediate' ? "bg-blue-400" : "bg-rose-500"
                          )}></div>
                          <span>难度: {q.difficulty === 'basic' ? '基础' : q.difficulty === 'intermediate' ? '进阶' : '挑战'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Zap size={12} className="text-amber-400 fill-current" />
                          <span>推荐复习指数: 9/10</span>
                       </div>
                    </div>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 group-hover:scale-110 transition-all shrink-0 shadow-sm mt-auto mb-auto">
                    <ChevronRight size={24} />
                 </div>
             </motion.div>
          ))}
          {filteredQuestions.length > 50 && (
            <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
              由于性能原因，仅展示前 50 条匹配题目... (共 {filteredQuestions.length} 条)
            </div>
          )}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-slate-300 w-8 h-8" />
               </div>
               <p className="text-slate-500 font-medium">未找到匹配的题目，请尝试更换搜索词或筛选条件</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Details Modal */}
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
                  {selectedQuestion.type === QuestionType.TRUE_FALSE && (
                    <div className="flex gap-4">
                       <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-600 text-center">正确</div>
                       <div className="flex-1 p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-600 text-center">错误</div>
                    </div>
                  )}
               </div>

               <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 mb-3 text-blue-800 font-black text-[10px] uppercase tracking-widest">
                     <FileText size={14} />
                     答案解析 (EXPLANATION)
                  </div>
                  <p className="text-blue-900 text-sm font-bold mb-2">
                    正确答案: <span className="text-emerald-600">{Array.isArray(selectedQuestion.correctAnswer) ? selectedQuestion.correctAnswer.join(', ') : selectedQuestion.correctAnswer}</span>
                  </p>
                  <p className="text-blue-700 text-xs leading-relaxed italic">
                    {selectedQuestion.explanation}
                  </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper: Intelligent Text Parser
function parseQuestionsFromText(text: string): Partial<Question>[] {
  const questions: Partial<Question>[] = [];
  // Regex to split by number patterns like "1.", "1、", "(1)"
  const questionBlocks = text.split(/\n(?=\d+[.．、\s]|\(\d+\))/g);

  for (const block of questionBlocks) {
    if (!block.trim()) continue;

    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Extract Question text (usually everything until the first option)
    let qText = '';
    let options: string[] = [];
    let answer = '';
    let readingOptions = false;

    for (let line of lines) {
      if (line.match(/^[A-D][.．、\s]/i) || line.startsWith('A') || line.startsWith('B')) {
        // Simple option extraction
        const opts = line.split(/(?=[A-D][.．、\s])/i).map(o => o.replace(/^[A-D][.．、\s]/i, '').trim());
        options.push(...opts);
        readingOptions = true;
      } else if (line.includes('答案') || line.startsWith('Ans')) {
        answer = line.replace(/.*答案[:：]\s*/, '').trim().charAt(0);
      } else if (!readingOptions) {
        qText += line + ' ';
      }
    }

    if (qText) {
      questions.push({
        text: qText.replace(/^\d+[.．、\s]*/, '').trim(),
        options: options.slice(0, 4),
        correctAnswer: answer || 'A',
        type: options.length > 0 ? QuestionType.SINGLE_CHOICE : QuestionType.SINGLE_CHOICE // Default to single
      });
    }
  }

  return questions;
}
