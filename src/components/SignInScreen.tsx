import React from 'react';
import { Button } from './ui/Common';
import { Mail, Lock, Eye, EyeOff, Sparkles, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/sound';
import { authService, AuthUser } from '../services/auth';

interface SignInScreenProps {
  onSuccess: (user: AuthUser) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

const NICKNAME_RE = /^[A-Za-z]+$/;
const GMAIL_RE = /^[^\s@]+@gmail\.com$/i;

function validateNickname(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Player nickname is required';
  if (!NICKNAME_RE.test(trimmed))
    return 'Only letters A–Z are allowed (no numbers, spaces, or symbols)';
  return undefined;
}

function validateEmail(value: string, isSignUp: boolean): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return 'Email is required';
  if (isSignUp) {
    if (!GMAIL_RE.test(trimmed)) return 'Please enter a valid Gmail address (e.g. you@gmail.com)';
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return 'Please enter a valid email address';
  }
  return undefined;
}

function validatePassword(value: string, isSignUp: boolean): string | undefined {
  if (!value) return 'Password cannot be empty';
  if (isSignUp) {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter';
    if (!/[a-z]/.test(value)) return 'Add at least one lowercase letter';
    if (!/[0-9]/.test(value)) return 'Add at least one number';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value))
      return 'Add at least one special character (e.g. ! @ # $ %)';
  } else {
    if (value.length < 4) return 'Password must be at least 4 characters';
  }
  return undefined;
}

interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
}

function getPasswordChecks(value: string): PasswordChecks {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    digit: /[0-9]/.test(value),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(value),
  };
}

function getStrength(checks: PasswordChecks): 'weak' | 'medium' | 'strong' {
  const count = Object.values(checks).filter(Boolean).length;
  if (count <= 2) return 'weak';
  if (count <= 4) return 'medium';
  return 'strong';
}

// ── component ─────────────────────────────────────────────────────────────────

export const SignInScreen: React.FC<SignInScreenProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Validation errors
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; name?: string }>({});
  const [submitted, setSubmitted] = React.useState(false);
  const [forgotPasswordMsg, setForgotPasswordMsg] = React.useState<string | null>(null);

  // ── real-time validation ───────────────────────────────────────────────────

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setErrors((prev) => ({ ...prev, name: validateNickname(val) }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    setErrors((prev) => ({ ...prev, email: validateEmail(val, isSignUp) }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (submitted || val.length > 0) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val, isSignUp) }));
    }
  };

  // ── submit ─────────────────────────────────────────────────────────────────

  const validate = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailErr = validateEmail(email, isSignUp);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validatePassword(password, isSignUp);
    if (passErr) newErrors.password = passErr;
    if (isSignUp) {
      const nameErr = validateNickname(name);
      if (nameErr) newErrors.name = nameErr;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForgotPasswordMsg(null);

    if (validate()) {
      sound.playClick();
      const res = isSignUp
        ? authService.signUp(email, password, name.trim())
        : authService.signIn(email, password);

      if (res.success) {
        sound.playWin();
        onSuccess(res.user);
      }
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    sound.playClick();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && emailRegex.test(email.trim())) {
      setForgotPasswordMsg(`Password reset link sent to ${email.trim()}`);
    } else {
      setForgotPasswordMsg('Please enter your email above to receive a reset link.');
    }
  };

  const toggleMode = () => {
    sound.playClick();
    setIsSignUp(!isSignUp);
    setErrors({});
    setSubmitted(false);
    setForgotPasswordMsg(null);
  };

  // ── password strength UI (sign-up only) ───────────────────────────────────

  const pwChecks = getPasswordChecks(password);
  const strength = getStrength(pwChecks);
  const showStrength = isSignUp && password.length > 0;

  const strengthLabel = { weak: 'Weak', medium: 'Medium', strong: 'Strong' }[strength];
  const strengthColor = {
    weak: 'bg-rose-500',
    medium: 'bg-amber-400',
    strong: 'bg-emerald-500',
  }[strength];
  const strengthTextColor = {
    weak: 'text-rose-400',
    medium: 'text-amber-400',
    strong: 'text-emerald-400',
  }[strength];
  const strengthBars = { weak: 1, medium: 2, strong: 3 }[strength];

  const pwRequirements: { key: keyof PasswordChecks; label: string }[] = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'upper', label: 'Uppercase letter (A–Z)' },
    { key: 'lower', label: 'Lowercase letter (a–z)' },
    { key: 'digit', label: 'Number (0–9)' },
    { key: 'special', label: 'Special character (! @ # $ % …)' },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6 animate-pop-in my-auto">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-pink-500 text-white font-black text-2xl shadow-xl shadow-indigo-500/25 mb-1 animate-float">
          OX
        </div>
        <h1 className="text-3xl font-black font-fredoka tracking-tight text-white flex items-center justify-center gap-1.5">
          <span>OX</span>
          <span className="text-pink-500">&</span>
          <span>SOS</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {isSignUp ? 'Create your player account to get started' : 'Welcome back! Sign in to join the arena'}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        {/* Glow decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10" noValidate>
          {/* Status Message */}
          {forgotPasswordMsg && (
            <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0 text-indigo-400" />
              <span>{forgotPasswordMsg}</span>
            </div>
          )}

          {/* Name Input (Sign Up only) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Player Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={15}
                  value={name}
                  onChange={handleNameChange}
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border rounded-2xl text-white font-medium focus:outline-none transition-colors ${
                    errors.name ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-500'
                  }`}
                  placeholder="e.g. MasterFox"
                />
                <Sparkles size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              </div>
              {errors.name && <p className="text-xs text-rose-400 font-semibold pl-1">{errors.name}</p>}
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-800 border rounded-2xl text-white font-medium focus:outline-none transition-colors ${
                  errors.email ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-500'
                }`}
                placeholder={isSignUp ? 'you@gmail.com' : 'player@example.com'}
                autoComplete="email"
              />
              <Mail size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            </div>
            {errors.email && <p className="text-xs text-rose-400 font-semibold pl-1">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-800 border rounded-2xl text-white font-medium focus:outline-none transition-colors ${
                  errors.password ? 'border-rose-500 focus:border-rose-400' : 'border-slate-700 focus:border-indigo-500'
                }`}
                placeholder="••••••••"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <Lock size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-rose-400 font-semibold pl-1">{errors.password}</p>}

            {/* Password Strength Indicator (sign-up only) */}
            {showStrength && (
              <div className="pt-1 space-y-2">
                {/* Strength bar */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          bar <= strengthBars ? strengthColor : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${strengthTextColor}`}>{strengthLabel}</span>
                </div>

                {/* Requirements checklist */}
                <ul className="space-y-0.5">
                  {pwRequirements.map(({ key, label }) => (
                    <li key={key} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                      pwChecks[key] ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      <span className="shrink-0">{pwChecks[key] ? '✓' : '○'}</span>
                      <span>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant={isSignUp ? 'sos' : 'ox'}
              size="lg"
              className="w-full"
              icon={isSignUp ? <UserPlus size={18} /> : <LogIn size={18} />}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </div>
        </form>

        {/* Switch Mode Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={toggleMode}
              className="font-bold text-indigo-400 hover:text-indigo-300 ml-1 transition-colors cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
