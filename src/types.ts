export interface ReviewIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  line?: number;
  codeSnippet?: string;
  suggestion?: string;
}

export interface CodeReview {
  overview: string;
  criticalIssues: ReviewIssue[];
  codeQuality: ReviewIssue[];
  performance: {
    summary: string;
    issues: ReviewIssue[];
  };
  security: {
    summary: string;
    issues: ReviewIssue[];
  };
  improvements: string[];
  score: number;
  scoreJustification: string;
  refactoredCode: string;
  historyId?: string;
}

export interface HistoryEntry {
  _id: string;
  score: number;
  issuesFound: number;
  createdAt: string;
  updatedAt: string;
  originalCode: string | null;
  refinedCode: string | null;
}

export interface AuthUser {
  _id: string;
  username: string;
  token: string;
}
