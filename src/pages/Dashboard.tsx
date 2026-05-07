import { useState } from 'react';
import { BookOpen, Trophy, Clock, CheckCircle2, ChevronRight, TrendingUp, FileText, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { exportExamToWord } from '../lib/exportUtils';
import { QUESTION_BANK } from '../data/questions';
import { QuestionType } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paperConfig, setPaperConfig] = useState({
    title: '电力系统分析自定义试卷',
    singleCount: 20,
    multipleCount: 10,
    binaryCount: 15,
    noDup: true,
    includeHard: false
  });

  const handleGenerateWord = () => {
    // Basic logic to pick questions based on counts
    const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5);
    const singles = shuffled.filter(q => q.type === QuestionType.SINGLE_CHOICE).slice(0, paperConfig.singleCount);
    const multiples = shuffled.filter(q => q.type === QuestionType.MULTIPLE_CHOICE).slice(0, paperConfig.multipleCount);
    const binaries = shuffled.filter(q => q.type === QuestionType.TRUE_FALSE).slice(0, paperConfig.binaryCount);
    
    const paperQuestions = [...singles, ...multiples, ...binaries];
    exportExamToWord(paperConfig.title, paperQuestions, true);
    alert('Word 试卷已生成并开始下载！');
  };

  const stats = [
    { label: '累计练习题目', value: '2,840', change: '+12%', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '综合正确率', value: '86.5%', sub: '稳态计算优', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: '平时成绩分布', value: '04/128', sub: 'RANKING', icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="flex flex-col w-full">
      <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100/80 px-4 py-2 rounded-xl w-96 border border-slate-200/50 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
            <Search className="mr-2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="搜索知识点：潮流计算、故障分析..." className="bg-transparent outline-none text-sm w-full font-medium" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#f1f5f9' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('离线版导出功能整理中，预计下周发布。')}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl font-bold text-slate-600 transition-all"
          >
            导出离线版
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/practice')}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            进入练习模式
          </motion.button>
        </div>
      </header>
      
      <div className="p-8 max-w-[1600px] w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Stats Row */}
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between transition-shadow hover:shadow-2xl hover:shadow-slate-200/50 cursor-default group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-4xl font-bold text-slate-900 mt-4 flex items-baseline gap-2 tracking-tighter">
                  {stat.value}
                  {stat.change && <span className="text-sm text-emerald-500 font-black">{stat.change}</span>}
                  {stat.sub && <span className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em]">{stat.sub}</span>}
                </h3>
              </div>
              <div className={cn("p-4 rounded-2xl transition-colors", stat.bg, "group-hover:scale-110 transition-transform")}>
                 <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
            </div>
            {i === 0 && (
              <div className="mt-8 flex gap-1.5 h-1.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="bg-blue-600 rounded-full"
                ></motion.div>
                <div className="bg-slate-100 rounded-full flex-1"></div>
              </div>
            )}
            {i === 1 && (
              <div className="mt-8 flex items-end gap-1.5 h-10">
                {[0.4, 0.6, 1, 0.5, 0.7, 0.3, 0.9].map((h, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 100}%` }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                    className="flex-1 bg-emerald-500/20 rounded-t-sm group-hover:bg-emerald-500 transition-colors"
                  ></motion.div>
                ))}
              </div>
            )}
            {i === 2 && (
              <div className="mt-8 flex items-center gap-2">
                 <div className="flex -space-x-2">
                    {[1,2,3,4].map(idx => (
                      <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">U{idx}</div>
                    ))}
                 </div>
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-2">Top 5% Performers</span>
              </div>
            )}
          </motion.div>
        ))}

        <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden group">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="space-y-1">
              <h2 className="font-black text-xl text-slate-900 tracking-tight">自定义模拟组卷</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Custom Exam Configuration</p>
            </div>
            <span className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-indigo-100 animate-pulse">智能拓扑算法</span>
          </div>
          <div className="p-10 grid grid-cols-3 gap-12">
            {[
              { label: '单选题数量', key: 'singleCount', value: paperConfig.singleCount },
              { label: '多选题数量', key: 'multipleCount', value: paperConfig.multipleCount },
              { label: '判断题数量', key: 'binaryCount', value: paperConfig.binaryCount },
            ].map(item => (
              <div key={item.label} className="space-y-6">
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</label>
                </div>
                <input 
                  type="number" 
                  value={item.value}
                  onChange={e => setPaperConfig({...paperConfig, [item.key]: parseInt(e.target.value) || 0})}
                  className="w-full text-5xl font-black border-none p-0 outline-none focus:text-blue-600 transition-colors bg-transparent text-slate-900 tracking-tighter"
                />
                <div className="h-0.5 bg-slate-100 w-full group-focus-within:bg-blue-100"></div>
              </div>
            ))}
          </div>
          <div className="px-8 pb-8 mt-auto flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={paperConfig.noDup} 
                  onChange={e => setPaperConfig({...paperConfig, noDup: e.target.checked})}
                  id="nodup" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                /> 
                <label htmlFor="nodup" className="text-xs text-slate-500 font-medium">查重过滤</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={paperConfig.includeHard} 
                  onChange={e => setPaperConfig({...paperConfig, includeHard: e.target.checked})}
                  id="hard" 
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                /> 
                <label htmlFor="hard" className="text-xs text-slate-500 font-medium">包含高难度题</label>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateWord}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
            >
              立即生成并导出 Word
            </motion.button>
          </div>
        </div>

        <div className="col-span-1 bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col shadow-2xl shadow-slate-900/20">
          <div className="mb-10">
            <h2 className="font-black text-xl mb-2 tracking-tight">知识点掌握热力图</h2>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Knowledge Mastery Distribution</p>
          </div>
          <div className="space-y-8 flex-1">
            {[
              { label: '电力系统潮流计算', value: 92, color: 'bg-blue-400' },
              { label: '对称故障与不对称故障', value: 78, color: 'bg-blue-400' },
              { label: '暂态稳定性分析', value: 45, color: 'bg-rose-500' },
              { label: '调压计算与无功补偿', value: 88, color: 'bg-emerald-400' },
            ].map(item => (
              <div key={item.label} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.label}</span>
                  <span className="text-xs font-black tracking-tighter">{item.value}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${item.color} shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                  />
                </div>
              </div>
            ))}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.15)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/stats')}
            className="mt-12 w-full py-4 bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase transition-all"
          >
            查看完整报告
          </motion.button>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden mt-4">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div className="space-y-1">
               <h3 className="font-black text-xl text-slate-900 tracking-tight">最近练习记录</h3>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Recent Session History</p>
             </div>
             <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => navigate('/stats')}
               className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 transition-all shadow-sm"
             >
               查看全部列表
             </motion.button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">试卷名称</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">练习时间</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">成绩</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">状态</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: '2023秋季学期-期末模拟冲刺卷 (01)', time: '2023-11-20 14:30', score: '94/100' },
                  { name: '电力潮流随机练习 (30题)', time: '2023-11-19 09:12', score: '82/100' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-slate-900">{row.name}</td>
                    <td className="px-8 py-6 text-xs text-slate-500 font-bold uppercase tracking-tight">{row.time}</td>
                    <td className="px-8 py-6 text-sm font-mono font-black text-slate-800">{row.score}</td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-lg uppercase tracking-widest border border-emerald-100">已通过</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <motion.button 
                          whileHover={{ scale: 1.1, x: 2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate('/stats')}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800"
                        >
                          详情
                        </motion.button>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <motion.button 
                          whileHover={{ scale: 1.1, x: 2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => alert('答案导出服务正在准备数据...')}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
                        >
                          导出答案
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
