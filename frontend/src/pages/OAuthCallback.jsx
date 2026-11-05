import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOAuthCallback } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const processOAuth = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const provider = searchParams.get('provider') || 'OAuth';
      const errorMsg = searchParams.get('error');

      if (errorMsg) {
        setError(errorMsg);
        if (showToast) showToast(`Authentication failed: ${errorMsg}`, 'error');
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      if (!token) {
        setError('No access token returned from OAuth provider');
        if (showToast) showToast('Authentication failed: Missing token', 'error');
        setTimeout(() => navigate('/login'), 2500);
        return;
      }

      try {
        const user = await handleOAuthCallback(token, refreshToken);
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        if (showToast) {
          showToast(`Successfully authenticated via ${providerName} OAuth 2.0! Welcome, ${user.name}!`, 'success');
        }
        navigate('/');
      } catch (err) {
        console.error('OAuth callback processing failed:', err);
        setError('Failed to establish authenticated session.');
        if (showToast) showToast('Failed to authenticate session', 'error');
        setTimeout(() => navigate('/login'), 2500);
      }
    };

    processOAuth();
  }, [searchParams, handleOAuthCallback, showToast, navigate]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
        {error ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <p className="text-xs text-slate-500">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-indigo-400 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Authenticating via OAuth 2.0</h2>
            <p className="text-sm text-slate-400 mb-6">
              Verifying token exchange and synchronizing your user profile...
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Secured with Passport.js & JWT
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
