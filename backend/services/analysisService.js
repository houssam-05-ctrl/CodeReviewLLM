let issueCounter = 0;
function id() {
  return `issue-${++issueCounter}`;
}

export const analyzeCode = (code) => {
  issueCounter = 0;
  const criticalIssues = [];
  const codeQuality = [];
  const performanceIssues = [];
  const securityIssues = [];
  const improvements = [];

  const lines = code.split('\n');
  const lineCount = lines.length;

  // ---- CRITICAL ISSUES ----

  // Check for eval()
  lines.forEach((line, i) => {
    if (/\beval\s*\(/.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Use of eval()',
        description: 'eval() executes arbitrary code and is a major security risk. It can lead to code injection attacks and is nearly impossible to optimize.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Replace eval() with JSON.parse() for data parsing, or use Function constructors with strict validation.',
      });
    }
  });

  // Check for innerHTML
  lines.forEach((line, i) => {
    if (/\.innerHTML\s*=/.test(line) && !/innerHTML\s*=/.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Unsafe innerHTML assignment',
        description: 'Direct innerHTML assignment can lead to Cross-Site Scripting (XSS) vulnerabilities if the content contains user-controlled data.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use textContent for plain text, or sanitize HTML with DOMPurify before assignment.',
      });
    }
  });

  // Check for document.write
  lines.forEach((line, i) => {
    if (/document\.write/.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Use of document.write()',
        description: 'document.write() is deprecated, blocks rendering, and can be exploited for XSS. It also behaves unpredictably in modern browsers.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use DOM APIs like appendChild(), insertAdjacentHTML(), or a framework rendering system.',
      });
    }
  });

  // Check for SQL injection patterns
  lines.forEach((line, i) => {
    if (/(SELECT|INSERT|UPDATE|DELETE)\s+.*\+.*\$\{|\+.*from/i.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Potential SQL Injection',
        description: 'String concatenation in SQL queries allows attackers to inject malicious SQL statements.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use parameterized queries or an ORM like Prisma/Sequelize.',
      });
    }
  });

  // Check for hardcoded secrets
  lines.forEach((line, i) => {
    if (/(password|secret|api_key|apikey|token|access_key)\s*[:=]\s*["'][^"']{8,}["']/i.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Hardcoded Secret/Credential',
        description: 'Credentials or secrets are hardcoded in the source code. These can be extracted by anyone with access to the codebase.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use environment variables (.env files) or a secrets manager (AWS Secrets Manager, HashiCorp Vault).',
      });
    }
  });

  // Check for unhandled promises
  if (/fetch\s*\(/.test(code) && !/\.catch\(|await|try\s*\{/.test(code)) {
    criticalIssues.push({
      id: id(),
      severity: 'critical',
      title: 'Unhandled Promise',
      description: 'A fetch() call without error handling will silently fail. Network errors or non-200 responses will not be caught.',
      suggestion: 'Add .catch() handler or wrap in try/catch with await.',
    });
  }

  // Check for sync XHR
  lines.forEach((line, i) => {
    if (/\.open\s*\([^)]*false\s*\)/.test(line)) {
      criticalIssues.push({
        id: id(),
        severity: 'critical',
        title: 'Synchronous XMLHttpRequest',
        description: 'Synchronous XHR blocks the main thread and freezes the UI. Deprecated on the main thread.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use async XHR or the modern fetch() API.',
      });
    }
  });

  // ---- SECURITY ISSUES ----

  lines.forEach((line, i) => {
    // Check for localStorage with sensitive data
    if (/localStorage\.(getItem|setItem|removeItem)/.test(line)) {
      if (/token|password|secret|key|auth/i.test(line)) {
        securityIssues.push({
          id: id(),
          severity: 'critical',
          title: 'Sensitive data in localStorage',
          description: 'Storing tokens, passwords, or secrets in localStorage is insecure. It is accessible to any JavaScript on the page and vulnerable to XSS.',
          line: i + 1,
          codeSnippet: line.trim(),
          suggestion: 'Use httpOnly cookies for tokens, or sessionStorage with additional protections.',
        });
      }
    }
  });

  // Check for missing Content Security Policy reference
  if (/<meta\s+http-equiv[^>]*Content-Security-Policy/i.test(code) === false && code.includes('<head>')) {
    securityIssues.push({
      id: id(),
      severity: 'warning',
      title: 'No Content-Security-Policy meta tag',
      description: 'Without a CSP, the page is more vulnerable to XSS attacks.',
      suggestion: 'Add a <meta http-equiv="Content-Security-Policy" content="..."> tag.',
    });
  }

  // Check for dangerous patterns
  if (/window\.location\.href\s*=.*\+/.test(code)) {
    securityIssues.push({
      id: id(),
      severity: 'critical',
      title: 'Open Redirect vulnerability',
      description: 'Dynamically setting window.location.href with unsanitized input can lead to open redirect attacks.',
      suggestion: 'Validate URLs against an allowlist before redirecting.',
    });
  }

  // ---- CODE QUALITY ----

  // Check for var usage
  lines.forEach((line, i) => {
    if (/\bvar\s+/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*') && !line.trim().startsWith('/*')) {
      codeQuality.push({
        id: id(),
        severity: 'warning',
        title: 'Use of var instead of let/const',
        description: 'var has function scope and can be hoisted unexpectedly, leading to bugs. Modern JavaScript should use let and const.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Replace var with const (default) or let (if reassignment is needed).',
      });
    }
  });

  // Check for console.log
  const consoleCount = (code.match(/console\.(log|warn|error|debug|info)/g) || []).length;
  if (consoleCount > 3) {
    codeQuality.push({
      id: id(),
      severity: 'info',
      title: 'Excessive console statements',
      description: `Found ${consoleCount} console statements. These should be removed in production or replaced with a proper logging library.`,
      suggestion: 'Use a logging library (winston, pino) or remove console statements with a build plugin.',
    });
  }

  // Check function length
  const functionMatches = code.match(/function\s+\w+\s*\([^)]*\)\s*\{/g) || [];
  functionMatches.forEach((match) => {
    const startIdx = code.indexOf(match);
    let braceCount = 0;
    let endIdx = startIdx;
    for (let j = startIdx; j < code.length; j++) {
      if (code[j] === '{') braceCount++;
      if (code[j] === '}') braceCount--;
      if (braceCount === 0) { endIdx = j; break; }
    }
    const funcBody = code.substring(startIdx, endIdx + 1);
    const funcLines = funcBody.split('\n').length;
    if (funcLines > 50) {
      codeQuality.push({
        id: id(),
        severity: 'warning',
        title: 'Function too long',
        description: `This function is ~${funcLines} lines long. Functions should generally be under 30 lines for readability and testability.`,
        suggestion: 'Break into smaller, focused functions with single responsibilities.',
      });
    }
  });

  // Check for nested if/else (callback hell / deep nesting)
  lines.forEach((line, i) => {
    const indent = line.search(/\S/);
    if (indent > 24 && line.trim().startsWith('if') || line.trim().startsWith('for') || line.trim().startsWith('while')) {
      codeQuality.push({
        id: id(),
        severity: 'warning',
        title: 'Deep nesting detected',
        description: 'Code is deeply nested (indentation > 24 spaces), indicating complex control flow that is hard to read and maintain.',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use guard clauses, early returns, or extract logic into separate functions.',
      });
    }
  });

  // Check for any usage
  if (/: any\b/.test(code) || /as any/.test(code)) {
    codeQuality.push({
      id: id(),
      severity: 'warning',
      title: 'Use of "any" type',
      description: 'Using "any" defeats TypeScript\'s type safety. It is better to define proper types or use unknown.',
      suggestion: 'Replace any with specific types, interfaces, or unknown with type guards.',
    });
  }

  // Check for duplicate variable declarations
  const varDeclarations = {};
  lines.forEach((line, i) => {
    const varMatch = line.match(/\b(?:const|let|var)\s+(\w+)/);
    if (varMatch) {
      const name = varMatch[1];
      if (varDeclarations[name]) {
        codeQuality.push({
          id: id(),
          severity: 'warning',
          title: `Duplicate variable declaration: "${name}"`,
          description: `Variable "${name}" is declared multiple times, which may indicate a bug or confusion.`,
          line: i + 1,
          suggestion: 'Remove duplicate declarations or rename variables to avoid shadowing.',
        });
      }
      varDeclarations[name] = i + 1;
    }
  });

  // Check for == instead of ===
  lines.forEach((line, i) => {
    if (/(?<![!=])==(?!=)/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
      codeQuality.push({
        id: id(),
        severity: 'warning',
        title: 'Loose equality comparison (==)',
        description: 'The == operator performs type coercion which can lead to unexpected results (e.g., "0" == false is true).',
        line: i + 1,
        codeSnippet: line.trim(),
        suggestion: 'Use strict equality (===) to avoid type coercion bugs.',
      });
    }
  });

  // Check for long lines
  lines.forEach((line, i) => {
    if (line.length > 120 && !line.trim().startsWith('//')) {
      codeQuality.push({
        id: id(),
        severity: 'info',
        title: 'Line exceeds 120 characters',
        description: `Line ${i + 1} is ${line.length} characters long. Long lines reduce readability.`,
        line: i + 1,
        suggestion: 'Break long lines into multiple lines following the project\'s formatting conventions.',
      });
    }
  });

  // ---- PERFORMANCE ----

  // Check for nested loops
  let loopDepth = 0;
  lines.forEach((line) => {
    if (/\b(for|while)\s*\(/.test(line)) loopDepth++;
    if (loopDepth > 2) {
      performanceIssues.push({
        id: id(),
        severity: 'warning',
        title: 'Nested loops detected (O(n²) or worse)',
        description: 'Nested loops can lead to exponential time complexity. Consider using a hash map or Set for O(n) lookups.',
        suggestion: 'Replace inner loop with a Map/Set for O(1) lookups, reducing overall complexity to O(n).',
      });
      loopDepth = 0;
    }
  });

  // Check for DOM manipulation in loops
  if (/for\s*\(|while\s*\(|\.forEach\s*\(/.test(code) && (code.includes('.innerHTML') || code.includes('.appendChild') || code.includes('.insertBefore'))) {
    performanceIssues.push({
      id: id(),
      severity: 'warning',
      title: 'DOM manipulation inside loop',
      description: 'Modifying the DOM inside a loop triggers multiple reflows and repaints, causing severe performance degradation.',
      suggestion: 'Batch DOM updates using DocumentFragment, or build a string and set innerHTML once.',
    });
  }

  // Check for setTimeout in loops
  if (/(for|while|forEach)/.test(code) && /setTimeout|setInterval/.test(code)) {
    performanceIssues.push({
      id: id(),
        severity: 'warning',
        title: 'Timer creation in loop',
        description: 'Creating multiple setTimeout/setInterval calls in a loop can lead to uncontrolled memory usage and unpredictable timing.',
        suggestion: 'Use requestAnimationFrame for animations, or manage a single timer with an index.',
      });
    }

  // Check for large array operations
  if (/\.(map|filter|reduce|forEach)\s*\(/.test(code)) {
    const arrayOps = (code.match(/\.(map|filter|reduce|forEach)\s*\(/g) || []).length;
    if (arrayOps > 5) {
      performanceIssues.push({
        id: id(),
        severity: 'info',
        title: 'Multiple array iterations',
        description: `Found ${arrayOps} array method calls. Chaining multiple array methods creates intermediate arrays, increasing memory usage.`,
        suggestion: 'Combine operations into a single reduce() call or use a for loop for large datasets.',
      });
    }
  }

  // Check for unoptimized re-renders (React)
  if (/useState/.test(code) && /useEffect/.test(code)) {
    if (!/useMemo|useCallback|React\.memo/.test(code)) {
      performanceIssues.push({
        id: id(),
        severity: 'info',
        title: 'Missing React performance optimizations',
        description: 'Component uses state and effects without memoization. This may cause unnecessary re-renders.',
        suggestion: 'Consider useMemo, useCallback, and React.memo for expensive computations and callbacks.',
      });
    }
  }

  // ---- IMPROVEMENTS ----

  improvements.push('Add JSDoc/TSDoc comments to all public functions and exported types for better developer experience.');
  improvements.push('Implement comprehensive unit tests covering edge cases, error paths, and happy paths.');
  improvements.push('Add TypeScript strict mode (strict: true in tsconfig.json) for maximum type safety.');
  improvements.push('Set up ESLint and Prettier in CI/CD to enforce code style and catch issues before merge.');
  improvements.push('Consider adding a CI/CD pipeline with automated testing, linting, and type checking.');

  if (criticalIssues.length === 0) {
    improvements.push('Consider adding input validation at the boundary layer (API endpoints, form submissions).');
  }
  if (!code.includes('try')) {
    improvements.push('Add error handling with try/catch blocks for all async operations and external calls.');
  }
  if (codeQuality.length > 3) {
    improvements.push('Run an automated code formatter (Prettier) and linter (ESLint) to fix formatting and common issues.');
  }

  // ---- SCORE CALCULATION ----
  let score = 10;
  score -= criticalIssues.length * 2;
  score -= securityIssues.filter(i => i.severity === 'critical').length * 1.5;
  score -= securityIssues.filter(i => i.severity === 'warning').length * 0.5;
  score -= codeQuality.filter(i => i.severity === 'critical').length * 1.5;
  score -= codeQuality.filter(i => i.severity === 'warning').length * 0.5;
  score -= codeQuality.filter(i => i.severity === 'info').length * 0.25;
  score -= performanceIssues.filter(i => i.severity === 'critical').length * 1.5;
  score -= performanceIssues.filter(i => i.severity === 'warning').length * 0.5;
  score = Math.max(1, Math.min(10, Math.round(score * 10) / 10));

  // ---- OVERVIEW ----
  const hasReact = code.includes('React') || code.includes('useState') || code.includes('useEffect') || code.includes('JSX');
  const hasNode = code.includes('require(') || code.includes('module.exports') || code.includes('process.env');
  const hasExpress = code.includes('express') || code.includes('app.get') || code.includes('app.post');

  let lang = 'JavaScript/TypeScript';
  if (code.includes('import ') || code.includes('export ')) lang = 'TypeScript/ES6+ JavaScript';
  if (code.includes('<?php')) lang = 'PHP';
  if (code.includes('def ') && code.includes(':')) lang = 'Python';
  if (code.includes('func ') || code.includes('package ')) lang = 'Go';

  const framework = hasReact ? 'React' : hasExpress ? 'Express.js' : hasNode ? 'Node.js' : null;
  const overview = `This ${lang} codebase${framework ? ` using ${framework}` : ''} contains approximately ${lineCount} lines of code across ${lines.filter(l => l.trim() && !l.trim().startsWith('//') && !l.trim().startsWith('*')).length} non-empty lines. The code appears to handle ${code.includes('async') || code.includes('fetch') || code.includes('axios') ? 'asynchronous operations and data fetching' : code.includes('class ') ? 'object-oriented patterns and class-based architecture' : code.includes('function') ? 'function-based logic' : 'general application logic'}${hasReact ? ' with React component patterns' : ''}. The analysis identified ${criticalIssues.length} critical issue(s), ${codeQuality.length} code quality concern(s), and ${securityIssues.length} security issue(s).`;

  // ---- SCORE JUSTIFICATION ----
  let scoreJustification = '';
  if (score >= 8) {
    scoreJustification = 'The code follows reasonable practices with minor issues. The main areas for improvement are ';
  } else if (score >= 5) {
    scoreJustification = 'The code has several notable issues that should be addressed before production. Key concerns include ';
  } else {
    scoreJustification = 'The code has serious issues that must be fixed before it can be considered production-ready. Critical problems include ';
  }

  const reasons = [];
  if (criticalIssues.length > 0) reasons.push(`${criticalIssues.length} critical bug(s)`);
  if (securityIssues.length > 0) reasons.push(`${securityIssues.length} security concern(s)`);
  if (performanceIssues.length > 0) reasons.push(`${performanceIssues.length} performance issue(s)`);
  if (codeQuality.length > 0) reasons.push(`${codeQuality.length} code quality issue(s)`);
  if (reasons.length === 0) reasons.push('general best practices and maintainability');
  scoreJustification += reasons.join(', ') + '.';

  // ---- REFACTORED CODE ----
  let refactoredCode = '// Refactored Version\n';
  refactoredCode += '// NOTE: This is a guideline based on the issues identified.\n';
  refactoredCode += '// Manual review is still recommended for business logic.\n\n';

  // Apply common refactoring patterns
  let refactored = code;

  // Replace var with const/let
  refactored = refactored.replace(/\bvar\s+/g, 'const ');

  // Replace == with ===
  refactored = refactored.replace(/(?<![!=])==(?!=)/g, '===');
  refactored = refactored.replace(/(?<!!)===(?!=)/g, '===');

  // Replace eval with JSON.parse
  refactored = refactored.replace(/\beval\s*\(/g, 'JSON.parse(');

  // Replace console.log with proper logging pattern
  refactored = refactored.replace(/console\.(log|warn|debug|info)\(/g, 'logger.$1(');

  // Add use strict if it's a Node.js file
  if (hasNode && !refactored.includes("'use strict'") && !refactored.includes('"use strict"')) {
    refactored = "'use strict';\n\n" + refactored;
  }

  if (criticalIssues.length > 0) {
    refactoredCode += '/*\n';
    refactoredCode += ' * CHANGES APPLIED:\n';
    refactoredCode += ' * - Replaced eval() with JSON.parse()\n';
    refactoredCode += ' * - Replaced var with const/let\n';
    refactoredCode += ' * - Replaced == with ===\n';
    refactoredCode += ' * - Replaced console.* with logger.*\n';
    refactoredCode += ' *\n';
    refactoredCode += ' * TODO: Review the following manually:\n';
    criticalIssues.forEach(issue => {
      refactoredCode += ` * - ${issue.title}: ${issue.suggestion}\n`;
    });
    refactoredCode += ' */\n\n';
  }

  refactoredCode += refactored;

  return {
    overview,
    criticalIssues,
    codeQuality,
    performance: {
      summary: performanceIssues.length > 0
        ? `${performanceIssues.length} performance issue(s) identified requiring attention.`
        : 'No major performance issues detected.',
      issues: performanceIssues,
    },
    security: {
      summary: securityIssues.length > 0
        ? `${securityIssues.length} security issue(s) found that should be addressed.`
        : 'No major security vulnerabilities detected in static analysis.',
      issues: securityIssues,
    },
    improvements,
    score,
    scoreJustification,
    refactoredCode,
  };
};
