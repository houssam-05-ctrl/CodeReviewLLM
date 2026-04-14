import { useState } from 'react';
import type { HistoryEntry } from '../types';
import { Clock, ChevronDown, ChevronRight, Code2, Copy, Check, Gauge } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryEntry[];
  isLoading: boolean;
  onRestore: (code: string) => void;
}

function ScoreDot({ score }: { score: number }) {
  const color = score >= 8 ? 'bg-emerald-400' : score >= 5 ? 'bg-amber-400' : 'bg-red-400';
  const text = score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${text}`}>
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {score}/10
    </span>
  );
}

function HistoryCard({ entry, onRestore }: { entry: HistoryEntry; onRestore: (code: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<'original' | 'refined' | null>(null);

  const copy = (text: string, type: 'original' | 'refined') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const date = new Date(entry.createdAt).toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-4 py-3 flex items-center gap-3"
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <ScoreDot score={entry.score} />
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Gauge className="w-3 h-3" /> {entry.issuesFound} issue{entry.issuesFound !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-zinc-600 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {date}
            </span>
          </div>
          {entry.originalCode && (
            <p className="text-xs text-zinc-500 font-mono mt-1 truncate">
              {entry.originalCode.split('\n')[0]}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Original Code */}
          {entry.originalCode ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Original Code</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRestore(entry.originalCode!)}
                    className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-violet-500/10 transition-colors"
                  >
                    <Code2 className="w-3 h-3" /> Restore to editor
                  </button>
                  <button
                    onClick={() => copy(entry.originalCode!, 'original')}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                  >
                    {copied === 'original' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
              </div>
              <pre className="bg-black/40 border border-white/5 rounded-lg p-3 font-mono text-xs text-zinc-400 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {entry.originalCode}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-zinc-600 italic">Original file not found on disk.</p>
          )}

          {/* Refined Code */}
          {entry.refinedCode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-bold">Refined Version</span>
                <button
                  onClick={() => copy(entry.refinedCode!, 'refined')}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  {copied === 'refined' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <pre className="bg-black/40 border border-emerald-500/10 rounded-lg p-3 font-mono text-xs text-emerald-300/70 overflow-x-auto max-h-48 whitespace-pre-wrap">
                {entry.refinedCode}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPanel({ history, isLoading, onRestore }: HistoryPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <svg className="animate-spin w-6 h-6 text-violet-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-24">
        <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-500">No reviews yet.</p>
        <p className="text-xs text-zinc-600 mt-1">Your analyzed code will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 mb-4">{history.length} review{history.length !== 1 ? 's' : ''} in your history</p>
      {history.map((entry) => (
        <HistoryCard key={entry._id} entry={entry} onRestore={onRestore} />
      ))}
    </div>
  );
}
