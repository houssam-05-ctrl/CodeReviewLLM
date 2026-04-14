import { useState } from 'react';
import type { CodeReview, ReviewIssue } from '../types';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Copy,
  Check,
  TrendingDown,
  Gauge,
  ShieldAlert,
  Wrench,
  Zap,
  FileCode,
  Eye,
  Star,
} from 'lucide-react';

interface ReviewResultsProps {
  review: CodeReview;
}

function SeverityBadge({ severity }: { severity: ReviewIssue['severity'] }) {
  const config = {
    critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500', label: 'CRITICAL' },
    warning:  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500', label: 'WARNING' },
    info:     { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500', label: 'INFO' },
  };
  const c = config[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function IssueCard({ issue }: { issue: ReviewIssue }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="group border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-start gap-3">
        <div className="mt-0.5">
          {expanded ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <SeverityBadge severity={issue.severity} />
            {issue.line && <span className="text-[10px] text-zinc-600 font-mono">Line {issue.line}</span>}
          </div>
          <h4 className="text-sm font-medium text-zinc-200 mt-1.5">{issue.title}</h4>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 ml-7 space-y-3">
          <p className="text-sm text-zinc-400 leading-relaxed">{issue.description}</p>
          {issue.codeSnippet && (
            <div className="rounded-lg bg-black/40 border border-white/5 p-3 font-mono text-xs text-red-300/80 overflow-x-auto">
              <div className="text-zinc-600 text-[10px] mb-1 uppercase tracking-wider">Found</div>
              <code>{issue.codeSnippet}</code>
            </div>
          )}
          {issue.suggestion && (
            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3">
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1">Suggestion</div>
              <p className="text-sm text-emerald-300/80">{issue.suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 10) * circumference;
  const color = score >= 8 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-[9px] text-zinc-500 uppercase tracking-wider">/ 10</span>
      </div>
    </div>
  );
}

function CopyBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative">
      <button onClick={handleCopy} className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10">
        {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
      </button>
      <pre className="bg-black/40 border border-white/5 rounded-xl p-4 pt-10 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
}

export default function ReviewResults({ review }: ReviewResultsProps) {
  const totalIssues = review.criticalIssues.length + review.codeQuality.length + review.performance.issues.length + review.security.issues.length;
  const criticalCount = review.criticalIssues.length + review.security.issues.filter((i) => i.severity === 'critical').length;
  const warningCount = review.codeQuality.filter((i) => i.severity === 'warning').length + review.performance.issues.filter((i) => i.severity === 'warning').length + review.security.issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Issues', value: totalIssues, icon: AlertCircle, color: 'text-zinc-200', bg: 'bg-white/5' },
          { label: 'Critical', value: criticalCount, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/5' },
          { label: 'Warnings', value: warningCount, icon: TrendingDown, color: 'text-amber-400', bg: 'bg-amber-500/5' },
          { label: 'Score', value: review.score.toString(), icon: Gauge,
            color: review.score >= 8 ? 'text-emerald-400' : review.score >= 5 ? 'text-amber-400' : 'text-red-400',
            bg: review.score >= 8 ? 'bg-emerald-500/5' : review.score >= 5 ? 'bg-amber-500/5' : 'bg-red-500/5' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} border border-white/5 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* 1. Overview */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <Eye className="w-4 h-4 text-violet-400" /><h3 className="text-sm font-semibold">1. Overview</h3>
        </div>
        <div className="p-5"><p className="text-sm text-zinc-400 leading-relaxed">{review.overview}</p></div>
      </div>

      {/* 2. Critical Issues */}
      <div className="border border-red-500/10 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-red-500/10 bg-red-500/[0.03]">
          <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400" /><h3 className="text-sm font-semibold text-red-300">2. Critical Issues</h3></div>
          <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full font-mono">{review.criticalIssues.length}</span>
        </div>
        <div className="p-4 space-y-3">
          {review.criticalIssues.length === 0
            ? <p className="text-sm text-zinc-500 text-center py-6">No critical issues detected. ✓</p>
            : review.criticalIssues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </div>

      {/* 3. Code Quality */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-blue-400" /><h3 className="text-sm font-semibold">3. Code Quality Issues</h3></div>
          <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-mono">{review.codeQuality.length}</span>
        </div>
        <div className="p-4 space-y-3">
          {review.codeQuality.length === 0
            ? <p className="text-sm text-zinc-500 text-center py-6">No code quality issues detected. ✓</p>
            : review.codeQuality.map((issue) => <IssueCard key={issue.id} issue={issue} />)}
        </div>
      </div>

      {/* 4. Performance */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /><h3 className="text-sm font-semibold">4. Performance Analysis</h3></div>
          <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full font-mono">{review.performance.issues.length}</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-400">{review.performance.summary}</p>
          {review.performance.issues.length === 0
            ? <p className="text-sm text-zinc-500 text-center py-4">No performance issues detected. ✓</p>
            : <div className="space-y-3">{review.performance.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div>}
        </div>
      </div>

      {/* 5. Security */}
      <div className="border border-orange-500/10 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-500/10 bg-orange-500/[0.03]">
          <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-orange-400" /><h3 className="text-sm font-semibold text-orange-300">5. Security Analysis</h3></div>
          <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full font-mono">{review.security.issues.length}</span>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-400">{review.security.summary}</p>
          {review.security.issues.length === 0
            ? <p className="text-sm text-zinc-500 text-center py-4">No security vulnerabilities detected in static analysis. ✓</p>
            : <div className="space-y-3">{review.security.issues.map((issue) => <IssueCard key={issue.id} issue={issue} />)}</div>}
        </div>
      </div>

      {/* 6. Improvements */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <TrendingDown className="w-4 h-4 text-emerald-400" /><h3 className="text-sm font-semibold">6. Improvements (Actionable)</h3>
        </div>
        <div className="p-5">
          <ol className="space-y-3">
            {review.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{item}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* 7. Score */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <Star className="w-4 h-4 text-yellow-400" /><h3 className="text-sm font-semibold">7. Score</h3>
        </div>
        <div className="p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <ScoreGauge score={review.score} />
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
              <span className={`text-3xl font-bold ${review.score >= 8 ? 'text-emerald-400' : review.score >= 5 ? 'text-amber-400' : 'text-red-400'}`}>{review.score}</span>
              <span className="text-sm text-zinc-500">/ 10</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">{review.scoreJustification}</p>
          </div>
        </div>
      </div>

      {/* 8. Refactored Version */}
      <div className="border border-white/5 rounded-2xl bg-[#0f0f17] overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <FileCode className="w-4 h-4 text-violet-400" /><h3 className="text-sm font-semibold">8. Refactored Version</h3>
        </div>
        <div className="p-5"><CopyBlock code={review.refactoredCode} /></div>
      </div>
    </div>
  );
}
