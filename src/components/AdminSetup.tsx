import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSetup() {
  const { signUpWithEmail } = useAuth();
  const [email] = useState('icoc.p2@gmail.com');
  const [password] = useState('$!Phoenix62');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setStatus('loading');
    setMessage('');

    const { data, error } = await signUpWithEmail(email, password);

    if (error) {
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError) {
          setStatus('success');
          setMessage('Admin account already exists. Redirecting to admin panel...');
          setTimeout(() => {
            window.location.href = '/admin';
          }, 1500);
        } else {
          setStatus('error');
          setMessage('Admin account exists but the password may be incorrect. If you forgot your password, please reset it.');
        }
      } else {
        setStatus('error');
        setMessage(error.message || 'Failed to create admin account');
      }
    } else if (data?.user) {
      setStatus('success');
      setMessage('Admin account created successfully! Redirecting to admin panel...');
      setTimeout(() => {
        window.location.href = '/admin';
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 px-8 py-12 text-center">
            <div className="inline-block p-4 bg-white bg-opacity-20 rounded-full mb-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Setup</h1>
            <p className="text-blue-100">Create your administrator account</p>
          </div>

          <div className="px-8 py-10">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                This will create an admin account for: <strong>icoc.p2@gmail.com</strong>
              </div>

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{message}</span>
                </div>
              )}

              {status === 'idle' && (
                <button
                  onClick={handleSetup}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Shield className="w-5 h-5" />
                  Create Admin Account
                </button>
              )}

              {status === 'loading' && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600">Creating account...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600">Redirecting to admin panel...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          One-time setup for administrator access
        </p>
      </div>
    </div>
  );
}
