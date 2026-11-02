import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Check, 
  Building2, 
  UserCheck, 
  Sparkles, 
  X, 
  ShieldCheck, 
  CheckCircle2,
  UserPlus,
  Loader2,
  ChevronRight,
  Smartphone
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

export const AuthView: React.FC = () => {
  const { setActiveView, account, updateAccount } = useTrading();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Google Account Chooser states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string | null>(null);
  const [isGoogleConnecting, setIsGoogleConnecting] = useState(false);
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Device Linked Google Accounts
  const linkedGoogleAccounts = [
    {
      name: 'Ahin Khan',
      email: 'ahinkhanmd@gmail.com',
      avatarBg: 'bg-emerald-600',
      initial: 'A',
      badge: 'Active Device Account'
    },
    {
      name: 'Trader Workspace',
      email: 'trader.quantbot@gmail.com',
      avatarBg: 'bg-indigo-600',
      initial: 'Q',
      badge: 'Quant Trading Profile'
    },
    {
      name: 'S. N. Roy Choudhury',
      email: 'roy.choudhury@gmail.com',
      avatarBg: 'bg-slate-700',
      initial: 'S',
      badge: 'SEBI Demat Linked'
    }
  ];

  // Sign In inputs
  const [emailOrUsername, setEmailOrUsername] = useState('trader@quantbot.in');
  const [password, setPassword] = useState('QuantAlpha2026!');

  // Sign Up / KYC inputs
  const [fullName, setFullName] = useState(account.fullName || 'S. N. Roy Choudhury');
  const [signupEmail, setSignupEmail] = useState(account.email || 'trader@quantbot.in');
  const [mobile, setMobile] = useState(account.mobile || '9876543210');
  const [panNumber, setPanNumber] = useState(account.panNumber || 'ABCDE1234F');
  const [dob, setDob] = useState(account.dob || '1992-08-14');
  const [annualIncome, setAnnualIncome] = useState(account.annualIncome || '₹10 - 25 Lakhs');
  const [tradingExperience, setTradingExperience] = useState(account.tradingExperience || 'Intermediate (1-3 Years)');
  const [selectedSegments, setSelectedSegments] = useState<string[]>(
    account.segments || ['NSE Equities (Cash)', 'Quant Algorithmic Automated']
  );
  const [bankName, setBankName] = useState(account.bankName || 'HDFC Bank Ltd.');
  const [bankAccountNumber, setBankAccountNumber] = useState(account.bankAccountNumber || '5010023910842');
  const [ifscCode, setIfscCode] = useState(account.ifscCode || 'HDFC0000014');
  const [mpin, setMpin] = useState(account.mpin || '140892');
  const [riskDisclosure, setRiskDisclosure] = useState(true);

  // Check if reduced motion is preferred
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Quick 1-click Demo Fill
  const handleQuickDemoFill = () => {
    if (isSignUp) {
      setFullName('Aditya Sharma');
      setSignupEmail('aditya.trader@quantbot.in');
      setMobile('9819283746');
      setPanNumber('BKZPS8821M');
      setDob('1994-11-23');
      setAnnualIncome('₹10 - 25 Lakhs');
      setTradingExperience('Advanced / Quant (> 3 Years)');
      setSelectedSegments(['NSE Equities (Cash)', 'Quant Algorithmic Automated', 'Futures & Options (F&O)']);
      setBankName('ICICI Bank Ltd.');
      setBankAccountNumber('001401569842');
      setIfscCode('ICIC0000014');
      setMpin('231194');
      setRiskDisclosure(true);
    } else {
      setEmailOrUsername('trader_07@quantbot.in');
      setPassword('QuantAlpha2026!');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateAccount({
      email: emailOrUsername.includes('@') ? emailOrUsername : account.email,
      username: emailOrUsername.split('@')[0] || 'Trader_07',
    });
    setActiveView('dashboard');
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedClientId = 'QB' + Math.floor(100000 + Math.random() * 900000);
    const generatedDemat = '12081600' + Math.floor(10000000 + Math.random() * 90000000);

    updateAccount({
      fullName,
      email: signupEmail,
      username: signupEmail.split('@')[0] || 'Trader_07',
      clientId: generatedClientId,
      mobile,
      panNumber: panNumber.toUpperCase(),
      dob,
      annualIncome,
      tradingExperience,
      segments: selectedSegments,
      bankName,
      bankAccountNumber,
      ifscCode: ifscCode.toUpperCase(),
      dematAccountNumber: generatedDemat,
      mpin,
      isKycVerified: true,
      riskDisclosureAccepted: riskDisclosure,
      virtualBalance: 100000.00,
      initialCapital: 100000.00
    });

    setActiveView('dashboard');
  };

  const handleSelectGoogleAccount = (acc: { name: string; email: string }) => {
    setSelectedGoogleAccount(acc.email);
    setIsGoogleConnecting(true);
    setTimeout(() => {
      updateAccount({
        fullName: acc.name,
        username: acc.name.split(' ')[0] || acc.email.split('@')[0],
        email: acc.email,
      });
      setIsGoogleConnecting(false);
      setShowGoogleModal(false);
      setShowCustomGoogleInput(false);
      setActiveView('dashboard');
    }, 800);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const derivedName = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    handleSelectGoogleAccount({
      name: derivedName,
      email: customGoogleEmail.trim(),
    });
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    if (provider === 'Google') {
      setShowGoogleModal(true);
      setShowCustomGoogleInput(false);
      return;
    }
    updateAccount({
      username: 'AppleTrader',
      email: 'apple@quantbot.in',
    });
    setActiveView('dashboard');
  };

  return (
    <div 
      className="min-h-screen w-full relative flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900"
      style={{
        backgroundColor: '#FAFAFB',
        fontFamily: "'Google Sans', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
      }}
    >
      {/* =========================================================================
          BACKGROUND GLOWING AURORA (3 Large Softly Drifting Gradient Orbs)
          - Exactly matching IntroScreen for seamless aesthetic continuation
          - Mint green, fresh emerald, soft teal
          - 25-35% opacity with 100-130px blur
         ========================================================================= */}
      <div 
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        aria-hidden="true"
      >
        {/* Orb 1: Soft Mint Green */}
        <div
          className={`absolute rounded-full filter blur-[100px] md:blur-[130px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-1'
          }`}
          style={{
            width: 'clamp(320px, 45vw, 600px)',
            height: 'clamp(320px, 45vw, 600px)',
            top: '25%',
            left: '35%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(167, 243, 208, 0.35) 0%, rgba(110, 231, 183, 0.22) 55%, transparent 75%)',
          }}
        />

        {/* Orb 2: Soft Fresh Emerald */}
        <div
          className={`absolute rounded-full filter blur-[110px] md:blur-[140px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-2'
          }`}
          style={{
            width: 'clamp(330px, 46vw, 620px)',
            height: 'clamp(330px, 46vw, 620px)',
            top: '40%',
            left: '65%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.28) 0%, rgba(16, 185, 129, 0.18) 55%, transparent 75%)',
          }}
        />

        {/* Orb 3: Soft Teal */}
        <div
          className={`absolute rounded-full filter blur-[95px] md:blur-[120px] transition-all ${
            prefersReducedMotion ? '' : 'animate-luma-orb-3'
          }`}
          style={{
            width: 'clamp(280px, 40vw, 520px)',
            height: 'clamp(280px, 40vw, 520px)',
            top: '60%',
            left: '48%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(94, 234, 212, 0.26) 0%, rgba(45, 212, 191, 0.16) 55%, transparent 75%)',
          }}
        />
      </div>

      {/* =========================================================================
          MAIN AUTHENTICATION CONTAINER (Luma Aesthetic: Airy, Clean, Centered)
         ========================================================================= */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto flex flex-col items-center animate-fade-in">
        
        {/* BRAND HEADER: Crisp Quant-Bot Logo + Wordmark */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div 
            className="relative mb-3 transition-transform duration-500 hover:scale-105"
            style={{
              width: 'clamp(64px, 10vw, 76px)',
              height: 'clamp(64px, 10vw, 76px)',
            }}
          >
            {/* Ambient backlight beneath logo */}
            <div 
              className="absolute -inset-2.5 rounded-[24px] bg-gradient-to-tr from-emerald-300/35 via-teal-200/30 to-transparent blur-md pointer-events-none" 
              aria-hidden="true"
            />
            {/* Crisp original logo asset */}
            <div className="relative w-full h-full rounded-[20px] sm:rounded-[22px] overflow-hidden bg-[#0F172A] shadow-lg shadow-slate-900/10 border border-slate-700/20 flex items-center justify-center p-0.5">
              <img
                src="/assets/aistudio/quant_bot._17eeebeb.png"
                alt="Quant-Bot"
                className="w-full h-full object-cover rounded-[18px] sm:rounded-[20px] select-none"
                decoding="async"
              />
            </div>
          </div>

          <h1 
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: '#111318', letterSpacing: '-0.03em' }}
          >
            Quant-Bot
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isSignUp 
              ? 'Create your account to start trading' 
              : 'Welcome back. Sign in to continue.'}
          </p>
        </div>

        {/* AUTH CARD */}
        <div className="w-full bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-8">
          
          {/* SEGMENTED TOGGLE: [Log In] [Sign Up] */}
          <div className="flex p-1 bg-slate-100/90 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                !isSignUp 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                isSignUp 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* SOCIAL LOGIN BUTTONS (Luma Style) */}
          {!isSignUp && (
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-700 flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
              >
                <svg className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.72-.94 2.74 1 .08 2.02-.49 2.64-1.24z" />
                </svg>
                <span>Continue with Apple</span>
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="border-t border-slate-200/80 w-full" />
                <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">or</span>
                <div className="border-t border-slate-200/80 w-full" />
              </div>
            </div>
          )}

          {/* =========================================================================
              LOGIN FORM
             ========================================================================= */}
          {!isSignUp ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="trader@quantbot.in or Trader_07"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600">Remember this device</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">256-bit SSL</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-2xl font-semibold text-xs sm:text-sm text-white bg-[#111318] hover:bg-slate-800 shadow-md shadow-slate-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            /* =========================================================================
                SIGN UP / REGULATORY KYC TRADING FORM
               ========================================================================= */
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
              
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant paper trading demat with <strong>₹1,00,000</strong> simulated funds.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (as on PAN)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. S. N. Roy Choudhury"
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Card Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="trader@quantbot.in"
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile (+91)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Annual Income
                  </label>
                  <select
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Below ₹1 Lakh">Below ₹1 Lakh</option>
                    <option value="₹1 - 5 Lakhs">₹1 - 5 Lakhs</option>
                    <option value="₹5 - 10 Lakhs">₹5 - 10 Lakhs</option>
                    <option value="₹10 - 25 Lakhs">₹10 - 25 Lakhs</option>
                    <option value="Above ₹25 Lakhs">Above ₹25 Lakhs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Experience
                  </label>
                  <select
                    value={tradingExperience}
                    onChange={(e) => setTradingExperience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Beginner (< 1 Year)">Beginner (&lt; 1 Year)</option>
                    <option value="Intermediate (1-3 Years)">Intermediate (1-3 Years)</option>
                    <option value="Advanced / Quant (> 3 Years)">Advanced / Quant (&gt; 3 Years)</option>
                  </select>
                </div>
              </div>

              {/* Settlement Bank Information */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Settlement Bank Details</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank (e.g. HDFC)"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account Number"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                  />
                  <input
                    type="text"
                    required
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="IFSC Code"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono uppercase"
                  />
                </div>
              </div>

              {/* 6-digit MPIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6-Digit Trading MPIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={mpin}
                  onChange={(e) => setMpin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full px-3 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-mono text-center tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  id="riskDisclosure"
                  type="checkbox"
                  required
                  checked={riskDisclosure}
                  onChange={(e) => setRiskDisclosure(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/30 cursor-pointer"
                />
                <label htmlFor="riskDisclosure" className="text-[11px] text-slate-500 leading-tight cursor-pointer">
                  I acknowledge SEBI trading disclosures and understand this platform operates in Paper Trading Mode with simulated execution.
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold text-xs sm:text-sm shadow-md shadow-emerald-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>Create Account &amp; Activate Demat</span>
              </button>
            </form>
          )}

          {/* Quick Demo Fill & Skip Buttons */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickDemoFill}
              className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Auto-Fill Demo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore as Guest</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>

        {/* Footer info note */}
        <div className="mt-6 text-center text-xs text-slate-400 font-medium flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Simulated Paper Trading · SEBI Compliant Sandboxing</span>
        </div>

      </div>

      {/* =========================================================================
          FORGOT PASSWORD MODAL (Luma Minimal Clean Style)
         ========================================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Reset Password</h3>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {forgotSent ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Password Reset Link Sent</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We've sent password reset instructions to <strong>{forgotEmail || 'your email'}</strong>.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSent(false);
                  }}
                  className="w-full mt-2 py-2.5 bg-[#111318] text-white text-xs font-semibold rounded-2xl cursor-pointer hover:bg-slate-800"
                >
                  Back to Log In
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#111318] text-white text-xs font-semibold rounded-2xl cursor-pointer hover:bg-slate-800 transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          GOOGLE ACCOUNT CHOOSER MODAL (Connected Accounts & Device Accounts)
         ========================================================================= */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 flex flex-col relative animate-fade-in">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">
                    Choose an account
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    to continue to <strong className="text-slate-800 font-semibold">Quant-Bot</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isGoogleConnecting) {
                    setShowGoogleModal(false);
                    setShowCustomGoogleInput(false);
                  }
                }}
                disabled={isGoogleConnecting}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Connecting State */}
            {isGoogleConnecting ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Connecting with Google...</p>
                  <p className="text-xs text-slate-500 mt-1">{selectedGoogleAccount}</p>
                </div>
                <div className="w-36 h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                  <div className="w-full h-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            ) : (
              /* Account List */
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 pb-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Accounts linked on this device</span>
                </div>

                {linkedGoogleAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ring-2 ring-white`}>
                        {acc.initial}
                      </div>
                      <div className="truncate">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono truncate">
                          {acc.email}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-medium">
                          {acc.badge}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                ))}

                {/* Use Another Account Option */}
                {!showCustomGoogleInput ? (
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-dashed border-slate-200 hover:border-slate-300 transition-all text-left cursor-pointer group mt-1"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                        Use another account
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sign in with a different Google account
                      </div>
                    </div>
                  </button>
                ) : (
                  <form onSubmit={handleCustomGoogleSubmit} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-800">Add Google Account</span>
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <input
                      type="email"
                      required
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      placeholder="your.email@gmail.com"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      placeholder="Display Name (optional)"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#111318] text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Connect Account &amp; Continue
                    </button>
                  </form>
                )}

                {/* Google Disclosure & Terms */}
                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center">
                  To continue, Google will share your name, email address, and profile picture with Quant-Bot.
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Shared Ambient Keyframe Styles */}
      <style>{`
        @keyframes lumaOrb1 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          33% {
            transform: translate(-46%, -53%) scale(1.08) translate3d(12px, -8px, 0);
          }
          66% {
            transform: translate(-54%, -47%) scale(0.94) translate3d(-10px, 10px, 0);
          }
        }

        @keyframes lumaOrb2 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          33% {
            transform: translate(-54%, -46%) scale(0.93) translate3d(-14px, 12px, 0);
          }
          66% {
            transform: translate(-47%, -54%) scale(1.07) translate3d(10px, -9px, 0);
          }
        }

        @keyframes lumaOrb3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) translate3d(0, 0, 0);
          }
          50% {
            transform: translate(-51%, -48%) scale(1.06) translate3d(8px, 10px, 0);
          }
        }

        .animate-luma-orb-1 {
          animation: lumaOrb1 9s ease-in-out infinite alternate;
          will-change: transform;
        }

        .animate-luma-orb-2 {
          animation: lumaOrb2 11s ease-in-out infinite alternate;
          will-change: transform;
        }

        .animate-luma-orb-3 {
          animation: lumaOrb3 8s ease-in-out infinite alternate;
          will-change: transform;
        }

        .animate-fade-in {
          animation: lumaFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes lumaFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-luma-orb-1,
          .animate-luma-orb-2,
          .animate-luma-orb-3,
          .animate-fade-in {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};
