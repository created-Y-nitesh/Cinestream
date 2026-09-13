import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/effects/PageTransition';
import { api, BackendHealth } from '../api/client';
import { getApiBaseUrl, STORAGE_KEYS } from '../api/config';
import { Button } from '../components/ui/Button';
import {
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Radio,
  Server,
  Sparkles,
  RefreshCw,
  Database,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, setTheme, reducedMotion, setReducedMotion } = useTheme();
  const { showToast } = useToast();

  // Backend Health Test State
  const [customApiUrl, setCustomApiUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_API_URL) || '';
  });
  const [healthStatus, setHealthStatus] = useState<BackendHealth | null>(null);
  const [testingHealth, setTestingHealth] = useState(false);
  const [forceMock, setForceMock] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.USE_MOCK_DATA) === 'true';
  });

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setTestingHealth(true);
    try {
      const health = await api.checkHealth();
      setHealthStatus(health);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setHealthStatus({
        connected: false,
        status: 'Unreachable',
        baseUrl: getApiBaseUrl(),
        isMock: false,
        message: msg,
      });
    } finally {
      setTestingHealth(false);
    }
  };

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customApiUrl.trim()) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_API_URL, customApiUrl.trim());
      showToast('Custom API Base URL saved!', 'success');
    } else {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_API_URL);
      showToast('Reset to default API Base URL', 'info');
    }
    runHealthCheck();
  };

  const handleToggleMockMode = (enabled: boolean) => {
    setForceMock(enabled);
    localStorage.setItem(STORAGE_KEYS.USE_MOCK_DATA, String(enabled));
    showToast(enabled ? 'Forced Mock Data Mode Enabled' : 'Live Backend Mode Enabled', 'info');
    runHealthCheck();
  };

  return (
    <PageTransition className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5 pb-4 border-b border-white/10 dark:border-white/10 light:border-black/10">
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white dark:text-white light:text-neutral-900 tracking-tight">
          Platform Preferences &amp; Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400">
          Theme, motion aur backend connection — sab yahan se check aur control karo.
        </p>
      </div>

      {/* 
        =======================================================================
        SECTION 1: THEME & VISUAL APPEARANCE
        =======================================================================
      */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl glass">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-crimson-400" />
          <h2 className="text-base font-bold text-white dark:text-white light:text-neutral-900">
            Interface Theme
          </h2>
        </div>
        <p className="text-xs text-neutral-400">
          Switch between cinematic dark mode (charcoal/navy) or crisp daytime light mode.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          {/* Dark */}
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-crimson-600/15 border-crimson-500 text-white shadow-lg shadow-crimson-500/20'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Moon className="w-6 h-6 mb-2 text-crimson-400" />
            <span className="text-xs font-semibold">Cinematic Dark</span>
          </button>

          {/* Light */}
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-crimson-600/15 border-crimson-500 text-white dark:text-white light:text-crimson-700 shadow-lg shadow-crimson-500/20'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sun className="w-6 h-6 mb-2 text-amber-400" />
            <span className="text-xs font-semibold">Daytime Light</span>
          </button>

          {/* System */}
          <button
            onClick={() => setTheme('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all cursor-pointer ${
              theme === 'system'
                ? 'bg-crimson-600/15 border-crimson-500 text-white shadow-lg shadow-crimson-500/20'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Monitor className="w-6 h-6 mb-2 text-wine-400" />
            <span className="text-xs font-semibold">Auto System</span>
          </button>
        </div>

        {/* Reduced Motion Toggle */}
        <div className="pt-4 mt-2 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white dark:text-white light:text-neutral-900">
              Respect Reduced Motion
            </span>
            <span className="text-[11px] text-neutral-400">
              Minimizes particle animations and large parallax transitions
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
              reducedMotion ? 'bg-crimson-600' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 2: BACKEND CONNECTION & DIAGNOSTICS
        =======================================================================
      */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-2xl glass">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-wine-400" />
            <h2 className="text-base font-bold text-white dark:text-white light:text-neutral-900">
              Backend Connection
            </h2>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={runHealthCheck}
            disabled={testingHealth}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${testingHealth ? 'animate-spin' : ''}`} />}
          >
            Test Connection
          </Button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Frontend saara data Vercel backend se leta hai, jo Google Sheet padhta hai. Backend URL na ho to demo (mock) catalog dikhta hai.
        </p>

        {/* Status Card */}
        {healthStatus && (
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
            healthStatus.connected
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : healthStatus.isMock
              ? 'bg-crimson-950/30 border-crimson-500/30 text-crimson-200'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {healthStatus.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Radio className="w-5 h-5 text-crimson-400 shrink-0 animate-pulse" />
              )}
              <div className="flex flex-col">
                <span className="font-bold">Status: {healthStatus.status}</span>
                <span className="opacity-80 text-[11px]">{healthStatus.message}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {healthStatus.videos !== undefined && (
                <span className="px-2.5 py-1 rounded bg-black/40 font-mono text-[11px] font-bold">
                  {healthStatus.videos} titles
                </span>
              )}
              {healthStatus.latencyMs !== undefined && (
                <span className="px-2.5 py-1 rounded bg-black/40 font-mono text-[11px] font-bold">
                  {healthStatus.latencyMs}ms
                </span>
              )}
            </div>
          </div>
        )}

        {/* Custom API Base URL Configurator */}
        <form onSubmit={handleSaveApiUrl} className="flex flex-col gap-2 pt-2">
          <label className="text-xs font-semibold text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
            Backend API Base URL (<code className="text-crimson-400">VITE_API_BASE_URL</code> override)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customApiUrl}
              onChange={e => setCustomApiUrl(e.target.value)}
              placeholder="https://your-backend.vercel.app"
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-neutral-800 dark:bg-neutral-800 light:bg-neutral-100 text-white dark:text-white light:text-neutral-900 border border-white/10 focus:border-crimson-500 focus:outline-none font-mono"
            />
            <Button type="submit" size="sm" variant="primary">
              Save URL
            </Button>
          </div>
          <span className="text-[11px] text-neutral-400">
            Khaali chhodne par build ka default URL use hoga. Yeh sirf is browser me save hota hai — testing ke liye useful.
          </span>
        </form>

        {/* Mock Mode Toggle */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-white dark:text-white light:text-neutral-900">
              Force Local Mock Store
            </span>
            <span className="text-[11px] text-neutral-400">
              Bypasses network calls for offline testing and static demonstration
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forceMock}
            onClick={() => handleToggleMockMode(!forceMock)}
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
              forceMock ? 'bg-crimson-600' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                forceMock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 
        =======================================================================
        SECTION 3: ARCHITECTURE OVERVIEW
        =======================================================================
      */}
      <div className="flex flex-col gap-3 p-4 sm:p-6 rounded-2xl glass">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-crimson-400" />
          <h2 className="text-base font-bold text-white dark:text-white light:text-neutral-900">
            Pipeline Architecture Flow
          </h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Frontend ke paas koi Google credential nahi jata — sab backend par rehta hai:
        </p>
        <div className="p-3 rounded-xl bg-black/50 border border-white/5 font-mono text-[11px] text-crimson-300 overflow-x-auto leading-relaxed">
          Google Drive (video files) → Google Sheet (links + metadata) → Apps Script / CSV → Vercel API → CineStream Frontend (InfinityFree)
        </div>
      </div>
    </PageTransition>
  );
};
