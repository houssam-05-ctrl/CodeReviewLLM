import { useState, useCallback } from 'react';
import type { CodeReview, HistoryEntry } from './types';
import { apiAnalyze, apiGetHistory } from './api/client';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CodeEditor from './components/CodeEditor';
import ReviewResults from './components/ReviewResults';
import HistoryPanel from './components/HistoryPanel';
import {
  Shield, Code2, Sparkles, FileCode,
  AlertTriangle, Clock, LogOut, Loader2,
} from 'lucide-react';

const SAMPLE_CODE = `function loginUser(username, password) {
  var db = getDatabase();
  var query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  var result = db.query(query);
  
  if (result == null) {
    return false;
  }
  
  var token = "secret_token_abc123xyz789";
  localStorage.setItem("authToken", token);
  
  for (var i = 0; i < 100; i++) {
    document.getElementById("log").innerHTML += result[i];
  }
  
  eval(result.callback);
  
  console.log("User logged in");
  console.log("Token: " + token);
  console.log("Query: " + query);
  console.log("Result: " + result);
  
  return true;
}`;

type Tab = 'write' | 'results' | 'history';

export default function App() {
  const { user, isLoading: authLoading, logout } = useAuth();

  const [code, setCode] = useState('');
  const [review, setReview] = useState<CodeReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const [apiError, setApiError] = useState('');

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);

  // ── Analyze ────────────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async (codeOrFile: string | File) => {
    const codeStr = codeOrFile instanceof File ? '' : codeOrFile;
    if (codeOrFile instanceof File === false && !codeStr.trim()) return;

    setIsAnalyzing(true);
    setApiError('');
    try {
      const result = await apiAnalyze(codeOrFile);
      setReview(result);
      setActiveTab('results');
      // Invalidate history cache so it refreshes next time tab is opened
      setHistoryFetched(false);
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // ── History ────────────────────────────────────────────────────────────────
  const handleOpenHistory = useCallback(async () => {
    setActiveTab('history');
    if (historyFetched) return;
    setHistoryLoading(true);
    try {
      const data = await apiGetHistory();
      setHistory(data);
      setHistoryFetched(true);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [historyFetched]);

  const handleRestoreFromHistory = (restoredCode: string) => {
    setCode(restoredCode);
    setActiveTab('write');
  };

  // ── Misc ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCode('');
    setReview(null);
    setApiError('');
    setActiveTab('write');
  };

  // Show nothing while auth is being hydrated from localStorage
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Not logged in → show Auth page
  if (!user) return <AuthPage />;

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* ── Header ── */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  Code<span className="text-violet-400">Review</span>
                  <span className="text-xs font-medium text-zinc-500 ml-1.5">Pro</span>
                </h1>
                <p className="text-[10px] text-zinc-500 -mt-0.5">Static Analysis Engine</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Username badge */}
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 bg-white/5 px-3 py-1.5 rounded-lg">
                <Shield className="w-3 h-3 text-violet-400" />
                {user.username}
              </span>

              {review && (
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                >
                  New Review
                </button>
              )}

              {/* Tab switcher */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  onClick={() => setActiveTab('write')}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${activeTab === 'write' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" /> Code
                  </span>
                </button>

                <button
                  onClick={() => review && setActiveTab('results')}
                  disabled={!review}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all disabled:opacity-30 ${activeTab === 'results' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Review
                    {review && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full">
                        {review.criticalIssues.length + review.security.issues.length}
                      </span>
                    )}
                  </span>
                </button>

                <button
                  onClick={handleOpenHistory}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${activeTab === 'history' ? 'bg-white/10 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> History
                  </span>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log out"
                className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* API Error banner */}
        {apiError && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/15 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {apiError}
            <button onClick={() => setApiError('')} className="ml-auto text-zinc-500 hover:text-white text-xs">✕</button>
          </div>
        )}

        {/* ── Code Tab ── */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            {!code && !review && (
              <div className="text-center py-12 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/20 mb-2">
                  <Code2 className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Paste your code. Get instant feedback.
                </h2>
                <p className="text-zinc-400 max-w-xl mx-auto text-sm">
                  Static analysis across 8 dimensions: overview, critical bugs, code quality,
                  performance, security, improvements, scoring, and refactored versions.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setCode(SAMPLE_CODE)}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-lg border border-violet-500/20 hover:bg-violet-500/10"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load sample code
                  </button>
                </div>
              </div>
            )}
            <CodeEditor
              code={code}
              onChange={setCode}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              hasCode={!!code}
            />
          </div>
        )}

        {/* ── Results Tab ── */}
        {activeTab === 'results' && review && <ReviewResults review={review} />}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            isLoading={historyLoading}
            onRestore={handleRestoreFromHistory}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-[11px] text-zinc-600">
            CodeReview Pro — Analysis performed server-side. Code files stored securely on-server.
          </p>
        </div>
      </footer>
    </div>
  );
}
