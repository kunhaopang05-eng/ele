import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import { TrendingUp, Target, Award, Calendar, BookOpen, ChevronRight, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface ExamRecord {
  id: string;
  title: string;
  score: number;
  date: string;
  correctCount: number;
  totalCount: number;
  chapters: string[];
}

export function Stats() {
  const history: ExamRecord[] = useMemo(() => {
    return JSON.parse(localStorage.getItem('psa_exam_history') || '[]');
  }, []);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    
    const avgScore = history.reduce((acc, h) => acc + h.score, 0) / history.length;
    const maxScore = Math.max(...history.map(h => h.score));
    const totalCorrect = history.reduce((acc, h) => acc + h.correctCount, 0);
    const totalQuestions = history.reduce((acc, h) => acc + h.totalCount, 0);
    const accuracy = (totalCorrect / totalQuestions) * 100;

    // Time series for line chart
    const lineData = history.slice(0, 10).reverse().map(h => ({
      date: new Date(h.date).toLocaleDateString(),
      score: h.score
    }));

    // Chapter distribution
    const chapterMap: Record<string, number> = {};
    history.forEach(h => {
      h.chapters.forEach(c => {
        chapterMap[c] = (chapterMap[c] || 0) + 1;
      });
    });
    const pieData = Object.entries(chapterMap).map(([name, value]) => ({ name, value }));

    return { avgScore, maxScore, accuracy, lineData, pieData };
  }, [history]);

  if (!stats) {
    return (
      <div className="p-12 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
           <BarChart3 size={32} className="text-slate-300" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">暂无考试记录</h2>
        <p className="text-slate-500 mt-2">完成至少一次模拟组卷或测试后即可查看统计分析。</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-[#f8fafc] font-sans">
      <header>
        <div className="flex items-center gap-3 text-blue-600 mb-2">
           <TrendingUp size={20} />
           <span className="font-bold tracking-widest text-[10px] uppercase">能力中心</span>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">学习能力评估</h2>
        <p className="text-slate-500 mt-2 font-medium">基于您的作答历史，为您提供全方位的专业知识掌握情况分析。</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Target, label: '平均分', value: Math.round(stats.avgScore), unit: '分', color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Award, label: '最高分', value: stats.maxScore, unit: '分', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: TrendingUp, label: '综合正确率', value: Math.round(stats.accuracy), unit: '%', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Calendar, label: '完成次数', value: history.length, unit: '次', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg)}>
               <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-bold text-slate-900">{s.value}</span>
               <span className="text-xs font-bold text-slate-500">{s.unit}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Line Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-slate-900">成绩趋势图</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Score Progression - Recent 10 Sessions</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chapter Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
           <div>
            <h3 className="font-bold text-slate-900">考察知识点分布</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Knowledge Coverage - Chapter Analysis</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="w-1/3 space-y-2">
               {stats.pieData.map((item, idx) => (
                 <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-slate-600 truncate">{item.name}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
           <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              历史测评记录
           </h3>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total: {history.length} Session(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 italic bg-white">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">考试项目</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">考试时间</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">题目总数</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">得分</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-900 text-sm">{h.title}</p>
                    <div className="flex gap-1 mt-1">
                      {h.chapters.slice(0, 2).map(c => (
                        <span key={c} className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-black uppercase tracking-widest">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-xs font-semibold text-slate-500">
                    {new Date(h.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-5 text-center text-xs font-bold text-slate-600">
                    {h.totalCount} 题
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "text-sm font-black",
                      h.score >= 90 ? "text-emerald-600" : h.score >= 60 ? "text-blue-600" : "text-red-500"
                    )}>
                      {h.score}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                       "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                       h.score >= 60 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {h.score >= 60 ? '合格' : '不合格'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
