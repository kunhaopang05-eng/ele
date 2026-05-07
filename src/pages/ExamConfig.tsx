import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, BookOpen, Layers, Zap, ArrowRight, Download, Info } from 'lucide-react';
import { CHAPTERS } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function ExamConfig() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    title: '电力系统分析模拟试卷',
    singleCount: 5,
    multipleCount: 2,
    binaryCount: 3,
    selectedChapters: [...CHAPTERS],
    difficulty: 'mixed' as 'basic' | 'intermediate' | 'advanced' | 'mixed'
  });

  const handleStart = () => {
    // In a real app, logic for selecting questions would go here
    navigate('/exam-session', { state: { config } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-3 text-blue-600">
            <Settings2 size={20} />
            <span className="font-bold tracking-widest text-[10px] uppercase">考试配置中心</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            历史试卷
          </motion.button>
        </div>
      </header>

      <div className="p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 overflow-y-auto">
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">试卷标题</label>
              <input 
                type="text" 
                value={config.title}
                onChange={e => setConfig({...config, title: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-900"
                placeholder="输入试卷名称..."
              />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {[
                { label: '单选题数量', key: 'singleCount', icon: '1' },
                { label: '多选题数量', key: 'multipleCount', icon: 'M' },
                { label: '判断题数量', key: 'binaryCount', icon: 'T/F' },
              ].map(item => (
                <div key={item.key} className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</label>
                  <input 
                    type="number" 
                    min="0"
                    max="50"
                    value={(config as any)[item.key]}
                    onChange={e => setConfig({...config, [item.key]: parseInt(e.target.value) || 0})}
                    className="w-full text-3xl font-light border-b-2 border-slate-100 pb-2 outline-none focus:border-blue-600 transition-colors bg-transparent text-slate-900"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">题目难度</label>
              <div className="flex gap-2">
                {['basic', 'intermediate', 'advanced', 'mixed'].map(d => (
                  <motion.button
                    key={d}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setConfig({...config, difficulty: d as any})}
                    className={cn(
                        "flex-1 py-3 px-2 rounded-xl text-xs font-bold border transition-all uppercase tracking-wider",
                        config.difficulty === d 
                            ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
                    )}
                  >
                    {d === 'basic' ? '基础' : d === 'intermediate' ? '进阶' : d === 'advanced' ? '难点' : '混合'}
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">考察章节范围</label>
                <button 
                  onClick={() => setConfig({...config, selectedChapters: config.selectedChapters.length === CHAPTERS.length ? [] : [...CHAPTERS]})}
                  className="text-[10px] text-blue-600 font-bold hover:underline"
                >
                    {config.selectedChapters.length === CHAPTERS.length ? '取消全选' : '全选所有章节'}
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHAPTERS.map(chapter => (
                  <motion.button
                    key={chapter}
                    whileHover={{ scale: 1.01, x: 2 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                        const next = config.selectedChapters.includes(chapter)
                            ? config.selectedChapters.filter(c => c !== chapter)
                            : [...config.selectedChapters, chapter];
                        setConfig({...config, selectedChapters: next});
                    }}
                    className={cn(
                        "flex items-center gap-3 p-4 rounded-xl text-left transition-all border",
                        config.selectedChapters.includes(chapter)
                            ? "bg-slate-50 border-blue-500 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                        "w-4 h-4 rounded flex items-center justify-center border transition-all",
                        config.selectedChapters.includes(chapter) ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
                    )}>
                        {config.selectedChapters.includes(chapter) && <Zap className="w-2.5 h-2.5 text-white fill-current" />}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{chapter}</span>
                  </motion.button>
                ))}
             </div>
          </section>
        </div>

        <div className="space-y-6">
           <div className="bg-slate-900 rounded-2xl p-8 text-white sticky top-24">
              <h4 className="font-bold text-lg mb-8 flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                试卷概要
              </h4>
              <div className="space-y-6 mb-10">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">总题数</span>
                    <span className="text-2xl font-light">{config.singleCount + config.multipleCount + config.binaryCount} <span className="text-xs text-slate-500">题</span></span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">预计耗时</span>
                    <span className="text-2xl font-light">{(config.singleCount + config.multipleCount + config.binaryCount) * 2} <span className="text-xs text-slate-500">min</span></span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">覆盖章节</span>
                    <span className="text-2xl font-light">{config.selectedChapters.length} <span className="text-xs text-slate-500">个</span></span>
                 </div>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-8 flex items-start gap-3 border border-white/5">
                 <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    生成的试卷可在答题页直接导出为打印版 Word 文档（含答案解析）。
                 </p>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStart}
                disabled={config.singleCount + config.multipleCount + config.binaryCount === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all transition-shadow"
              >
                开始模拟测试
                <ArrowRight size={18} />
              </motion.button>
           </div>
        </div>
      </div>
    </div>
  );
}
