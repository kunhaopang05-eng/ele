import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, User, Mail, GraduationCap, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Login() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', major: '电气工程及其自动化', pass: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.pass);
      } else {
        await register(formData.name, formData.email, formData.major);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        <div className="text-center mb-10 space-y-4">
          <div className="w-12 h-12 bg-blue-600 rounded flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-200">
            <Zap className="fill-current w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">电力系统分析</h1>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">专业教学考评系统</p>
          </div>
        </div>

        <motion.div 
          layout
          className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200"
        >
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              账户登录
            </button>
            <button 
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${!isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              学员注册
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">学员姓名</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="你的姓名"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">电子邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="email" 
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">所属专业</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    placeholder="例如：电气工程及其自动化"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                    value={formData.major}
                    onChange={e => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">安全密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-sm"
                  value={formData.pass}
                  onChange={e => setFormData({ ...formData, pass: e.target.value })}
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition-all transition-shadow"
            >
              <span>{loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '确认登录' : '立即注册')}</span>
              {!loading && (
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.6 }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-8 leading-relaxed">
            {isLogin ? "PRO PROFESSIONAL EVALUATION SYSTEM" : "JOIN THE ENGINEERING COMMUNITY"}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
