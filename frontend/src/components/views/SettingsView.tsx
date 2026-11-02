import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { CheckCircle2, RotateCcw, ShieldCheck, Lock, User, Check, X, LogOut } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { account, updateAccount, resetAccountState, startLoadingAnimation, setActiveView } = useTrading();
  const [activeTab, setActiveTab] = useState<'Account' | 'Trading' | 'Risk' | 'Notifications'>('Account');

  const [username, setUsername] = useState(account.username);
  const [email, setEmail] = useState(account.email);
  const [riskLevel, setRiskLevel] = useState(account.riskLevel);
  const [maxPositionSize, setMaxPositionSize] = useState(account.maxPositionSize);
  const [stopLossPercent, setStopLossPercent] = useState(account.stopLossPercent);
  const [isSaved, setIsSaved] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount({
      username,
      email,
      riskLevel,
      maxPositionSize,
      stopLossPercent
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Reset your paper portfolio to ₹1,00,000 and restore default holdings?')) {
      resetAccountState();
      setIsReset(true);
      setTimeout(() => setIsReset(false), 2500);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassUpdated(true);
    setTimeout(() => {
      setPassUpdated(false);
      setShowPasswordModal(false);
      setCurrentPass('');
      setNewPass('');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header matching Collage */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your account and trading preferences
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startLoadingAnimation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Replay 3s Intro</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            <span>Reset Capital (₹1,00,000)</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Collage */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs overflow-x-auto">
        {(['Account', 'Trading', 'Risk', 'Notifications'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 font-semibold transition-all cursor-pointer border-b-2 -mb-[1px] whitespace-nowrap ${
              activeTab === tab
                ? 'border-[#0F172A] text-[#0F172A]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Trading preferences and account profile updated.</span>
        </div>
      )}

      {isReset && (
        <div className="p-3 bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paper trading portfolio reset to initial ₹1,00,000.</span>
        </div>
      )}

      {/* Main 2-Panel Grid matching Collage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Profile Information matching Collage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 mb-5">
              Profile Information
            </h3>

            {/* Profile Avatar & Details matching Collage */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xl ring-4 ring-slate-100">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Username</span>
                  <span className="text-sm font-bold text-slate-900">{username}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-medium">Email</span>
                  <span className="text-xs font-mono text-slate-600">{email}</span>
                </div>
              </div>
            </div>

            {/* Regulatory Demat Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 mb-4 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Client ID</span>
                <span className="font-bold text-slate-900">{account.clientId || 'QB884102'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Demat Account</span>
                <span className="font-bold text-slate-900">{account.dematAccountNumber || '1208160004928173'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">SEBI Status</span>
                <span className="font-bold text-emerald-600 font-sans">KYC Verified</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Update Password
            </button>

            {/* Logout option at middle bottom in all red fonts */}
            <div className="flex justify-center pt-0.5">
              <button
                type="button"
                onClick={() => setActiveView('auth')}
                className="inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all cursor-pointer group"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-rose-600 font-semibold tracking-wide">Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Trading Preferences matching Collage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <form onSubmit={handleSave} className="flex flex-col justify-between h-full">
            <div>
              <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 mb-5">
                Trading Preferences
              </h3>

              <div className="space-y-4">
                {/* Risk Level dropdown matching Collage */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Risk Level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  >
                    <option value="Conservative">Conservative</option>
                    <option value="Medium">Medium</option>
                    <option value="Aggressive">Aggressive</option>
                  </select>
                </div>

                {/* Max Position Size matching Collage */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Max Position Size
                  </label>
                  <select
                    value={maxPositionSize}
                    onChange={(e) => setMaxPositionSize(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  >
                    <option value={5}>5%</option>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                    <option value={50}>50%</option>
                  </select>
                </div>

                {/* Stop Loss matching Collage */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Stop Loss
                  </label>
                  <select
                    value={stopLossPercent}
                    onChange={(e) => setStopLossPercent(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                  >
                    <option value={1.5}>1.5%</option>
                    <option value={2.5}>2.5%</option>
                    <option value={5.0}>5.0%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Changes button matching Collage */}
            <button
              type="submit"
              className="w-full mt-6 py-2.5 px-4 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Update Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passUpdated ? (
              <div className="text-center py-4 space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Password Updated Successfully</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="Enter new password"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-[#0F172A] text-white text-xs font-semibold rounded-xl cursor-pointer hover:bg-slate-800"
                >
                  Save Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
