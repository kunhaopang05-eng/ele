import { Zap, BookOpen, FileText, BarChart3, Settings, LogOut, LayoutDashboard, Database, Download, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

import { motion } from 'motion/react';

export function Sidebar() {
  const { logout } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: '概览', to: '/' },
    { icon: Database, label: '专业题库', to: '/bank' },
    { icon: FileText, label: '模拟组卷', to: '/exam-config' },
    { icon: BarChart3, label: '成绩统计', to: '/stats' },
    { icon: BookOpen, label: '错题集', to: '/wrong' },
    { icon: Settings, label: '个人中心', to: '/profile' },
  ];

  return (
    <aside className="w-72 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0 font-sans shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-8 flex items-center gap-4">
        <motion.div 
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20"
        >
          <Zap className="w-5 h-5 fill-current" />
        </motion.div>
        <div>
          <h1 className="font-black text-xl leading-none tracking-tighter text-slate-900">
            ESA<span className="text-blue-600">.</span>PRO
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Teaching Eval</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">主菜单 Menu</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "block transition-all",
              isActive ? "z-10" : "z-0"
            )}
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 4, backgroundColor: isActive ? '#eff6ff' : '#f8fafc' }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-sm font-bold tracking-tight",
                  isActive 
                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                    : "text-slate-500 border border-transparent hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400")} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100/50">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden shadow-sm">
             <User className="w-7 h-7" />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-black text-slate-900 truncate tracking-tight">陈教授 (校正员)</p>
            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">电力工程系</p>
          </div>
        </div>
        <motion.button 
          whileHover={{ x: 2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="flex items-center gap-3 px-5 py-3 w-full text-slate-400 hover:text-red-600 transition-all text-xs font-black uppercase tracking-widest"
        >
          <LogOut className="w-5 h-5" />
          <span>退出系统</span>
        </motion.button>
      </div>
    </aside>
  );
}
