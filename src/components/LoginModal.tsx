import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  LogOut,
  Sparkles 
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  sendEmailVerification, 
  signOut,
  User 
} from 'firebase/auth';
import { auth } from '../lib/firebase';

interface LoginModalProps {
  currentUser: User | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ currentUser }) => {
  const [email, setEmail] = useState('khjjvhasnhsbbs@gmail.com');
  const [password, setPassword] = useState('rahat1254');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Successfully logged in.');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email resent! Please check your inbox and verify.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // If user is logged in but email is not verified
  if (currentUser && !currentUser.emailVerified) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Email Verification Required</h2>
            <p className="text-sm text-slate-400">
              We have sent a verification link to <strong className="text-slate-200">{currentUser.email}</strong>. Please check your inbox and verify your email address to access the Towa Admin Suite.
            </p>
          </div>

          {error && (
            <div className="bg-rose-950/60 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs">
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Resend Verification Email</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Use Different Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login Modal / Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Towa Admin Portal</h2>
            <p className="text-xs text-slate-400">Secure Executive Access</p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@towastore.shop"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-emerald-400 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-11 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Sign In to Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-500 font-mono">
          Secured with Firebase Authentication & Firestore
        </div>
      </div>
    </div>
  );
};
