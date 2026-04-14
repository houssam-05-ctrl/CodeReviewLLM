import { useRef } from 'react';
import { Play, Eraser, Upload } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onAnalyze: (codeOrFile: string | File) => void;
  isAnalyzing: boolean;
  hasCode: boolean;
}

export default function CodeEditor({ code, onChange, onAnalyze, isAnalyzing, hasCode }: CodeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Preview the file content in the editor AND pass the File to analyze
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onChange(text);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
    // Directly analyze the file (sent as multipart)
    onAnalyze(file);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f0f17] overflow-hidden shadow-2xl shadow-black/40">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#12121c]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-zinc-500 ml-2 font-mono">input.js</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-600">{code.split('\n').length} lines</span>
          <span className="text-[10px] text-zinc-600">{code.length} chars</span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder="// Paste your code here, or upload a file below..."
          className="w-full h-[420px] bg-transparent text-zinc-200 font-mono text-sm p-4 resize-none focus:outline-none placeholder:text-zinc-700 leading-relaxed"
          spellCheck={false}
        />
      </div>

      {/* Editor Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#12121c]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onChange('')}
            disabled={!hasCode}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>

          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".js,.ts,.jsx,.tsx,.py,.go,.php,.rb,.java,.cs,.cpp,.c,.html,.css,.json,.txt"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-30 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 border border-violet-500/20"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload file
          </button>
        </div>

        <button
          onClick={() => onAnalyze(code)}
          disabled={!hasCode || isAnalyzing}
          className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Analyze Code
            </>
          )}
        </button>
      </div>
    </div>
  );
}
