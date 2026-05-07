import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, GraduationCap, MapPin, Award, Shield, Edit2, Camera, LogOut, CheckCircle2, Navigation, Loader2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export function Profile() {
  const { user, login, register, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const fetchLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('您的浏览器不支持地理定位。');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Error fetching location:', error);
        let errorMsg = '无法获取位置';
        if (error.code === error.PERMISSION_DENIED) errorMsg = '地理定位权限被拒绝';
        else if (error.code === error.POSITION_UNAVAILABLE) errorMsg = '位置信息暂不可用';
        else if (error.code === error.TIMEOUT) errorMsg = '请求位置超时';
        
        setLocationError(errorMsg);
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };
  
  const handleSave = () => {
     if (!editedUser) return;
     setIsUpdating(true);
     setTimeout(() => {
        updateUser(editedUser);
        setIsUpdating(false);
        setIsEditing(false);
        alert('资料更新成功！');
     }, 800);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editedUser) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setEditedUser(prev => prev ? ({ ...prev, avatar: base64 }) : null);
        
        if (!isEditing) setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user || !editedUser) return null;

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-10 min-h-screen font-sans">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400 mb-2">
             <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                <User size={16} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-[0.3em]">Identity Hub</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">个人账户中心</h2>
          <p className="text-slate-400 text-sm font-bold tracking-tight">管理您的学术身份与专业资料，实时同步您的学习进度与成就。</p>
        </div>
        <div className="flex gap-4">
          {isEditing && (
             <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: '#2563eb' }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isUpdating}
                className="flex items-center gap-3 bg-blue-600 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 disabled:opacity-50"
             >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                保存更新
             </motion.button>
          )}
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#f8fafc' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if(isEditing) setEditedUser(user);
              setIsEditing(!isEditing);
            }}
            className="flex items-center gap-3 bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm"
          >
            {isEditing ? <X size={16} /> : <Edit2 size={16} />}
            {isEditing ? '中止编辑' : '进入编辑模式'}
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden text-center group transition-all hover:shadow-2xl hover:shadow-slate-200/50">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative inline-block mb-8">
              <div className="w-40 h-40 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200 border-4 border-white shadow-2xl relative overflow-hidden">
                 {editedUser.avatar ? (
                    <img src={editedUser.avatar} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                 ) : (
                    <User size={80} />
                 )}
                 <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, backgroundColor: '#2563eb' }}
                whileTap={{ scale: 0.9 }}
                onClick={handleAvatarClick}
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-transform"
              >
                <Camera size={20} />
              </motion.button>
            </div>
            {isEditing ? (
              <input 
                 type="text"
                 value={editedUser.name}
                 onChange={e => setEditedUser({...editedUser, name: e.target.value})}
                 className="text-2xl font-black text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-2 w-full text-center outline-none focus:border-blue-500 focus:bg-white transition-all tracking-tight"
              />
            ) : (
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{user.name}</h3>
            )}
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mt-3">
               {user.major}
            </p>
            
            <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-50">
              <div className="text-center">
                <p className="text-3xl font-black text-slate-900 leading-none">12</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">已获勋章</p>
              </div>
              <div className="text-center border-l border-slate-100">
                <p className="text-3xl font-black text-slate-900 leading-none">LV 4</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">学术等阶</p>
              </div>
            </div>

            <div className="absolute top-0 right-0 p-6">
               <Shield size={24} className="text-slate-50" />
            </div>
          </div>

          <motion.button 
            whileHover={{ x: 2, color: '#f43f5e' }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full flex items-center justify-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] p-6 transition-all border-2 border-transparent hover:border-rose-50 hover:bg-rose-50/50 rounded-3xl"
          >
            <LogOut size={16} />
            退出当前的系统连接
          </motion.button>
        </div>

        <div className="md:col-span-2 space-y-10">
           <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-slate-200/50">
             <div className="flex justify-between items-center mb-12 pb-6 border-b border-slate-50">
               <div>
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">详细档案资料</h4>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Detailed Profile Information</p>
               </div>
               <Award size={24} className="text-blue-600 opacity-20" />
             </div>
             
             <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">电子邮箱 Account Email</label>
                      <div className="flex items-center gap-5 group">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                            <Mail size={20} />
                         </div>
                         {isEditing ? (
                           <input 
                               type="email"
                               value={editedUser.email}
                               onChange={e => setEditedUser({...editedUser, email: e.target.value})}
                               className="font-bold text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white w-full transition-all"
                           />
                         ) : (
                           <p className="text-lg font-bold text-slate-900 tracking-tight">{user.email}</p>
                         )}
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">所在院校/专业 Department</label>
                      <div className="flex items-center gap-5 group">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                            <GraduationCap size={20} />
                         </div>
                         {isEditing ? (
                           <input 
                               type="text"
                               value={editedUser.major}
                               onChange={e => setEditedUser({...editedUser, major: e.target.value})}
                               className="font-bold text-slate-900 bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:bg-white w-full transition-all"
                           />
                         ) : (
                           <p className="text-lg font-bold text-slate-900 tracking-tight">{user.major}</p>
                         )}
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-6">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">地理位置 Geolocation</label>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={fetchLocation}
                          disabled={isLocating}
                          className="text-[10px] font-black text-blue-600 flex items-center gap-2 hover:underline disabled:opacity-50 uppercase tracking-widest"
                        >
                          {isLocating ? <Loader2 size={12} className="animate-spin" /> : <Navigation size={12} />}
                          {isLocating ? '正在捕获...' : '重新捕获'}
                        </motion.button>
                      </div>
                      <div className="flex items-center gap-5 group">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                            <MapPin size={20} />
                         </div>
                         <div>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">{location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : '中国 · 长沙 (Default)'}</p>
                            {locationError && <p className="text-[10px] text-rose-500 font-black mt-1 uppercase">{locationError}</p>}
                            {location && <p className="text-[10px] text-emerald-500 font-black mt-1 uppercase tracking-widest">Precision Satellite Lock</p>}
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">学号/工号 Professional ID</label>
                      <div className="flex items-center gap-5 group">
                         <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                            <Shield size={20} />
                         </div>
                         <p className="text-lg font-bold text-slate-900 tracking-tighter">2024E050720</p>
                      </div>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-slate-900 p-12 rounded-[4rem] text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 group">
              <div className="relative z-10 flex">
                <div className="flex-1">
                   <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">实时学习进度报告 Real-time Progress</h4>
                   <div className="space-y-8">
                     <p className="text-lg font-bold text-slate-300 leading-tight pr-10">
                       您已全面进入本系统的专业学习通道，目前已掌握 <span className="text-white text-2xl font-black mx-1">24%</span> 的核心知识点。
                     </p>
                     <div className="space-y-3">
                       <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mastery Level</span>
                         <span className="text-xs font-black">24%</span>
                       </div>
                       <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: '24%' }}
                             transition={{ duration: 1.5, ease: 'easeOut' }}
                             className="bg-blue-500 h-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
                          />
                       </div>
                     </div>
                   </div>
                </div>
                <div className="flex items-center justify-center w-32 shrink-0">
                   <div className="w-24 h-24 border-8 border-blue-500/10 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <CheckCircle2 size={40} className="text-blue-400" />
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] -mr-40 -mt-40" />
           </div>
        </div>
      </div>
    </div>
  );
}
