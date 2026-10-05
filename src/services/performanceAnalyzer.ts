import { PerformanceConcern, ProjectFile } from '../types/analyzer';

/**
 * Scan analyzed files for performance bottlenecks
 */
export function analyzePerformance(files: ProjectFile[]): PerformanceConcern[] {
  const concerns: PerformanceConcern[] = [];
  let idCounter = 1;

  for (const file of files) {
    if (file.classification !== 'SAFE' || !file.content) continue;

    const lines = file.content.split('\n');
    let inLoop = false;
    let loopLine = 0;

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      const cleanLine = lineText.trim();
      if (cleanLine.startsWith('//') || cleanLine.startsWith('/*')) return;

      // Track loop scopes
      if (/\b(for\s*\(|while\s*\(|\.forEach\s*\(|\.map\s*\()/.test(cleanLine)) {
        inLoop = true;
        loopLine = lineNum;
      }
      if (cleanLine.includes('}') && inLoop && lineNum - loopLine > 15) {
        inLoop = false;
      }

      // 1. Repeated querySelector inside loops
      if (inLoop && /document\.(?:querySelector|querySelectorAll|getElementById|getElementsByClassName)\s*\(/.test(cleanLine)) {
        concerns.push({
          id: `perf_${idCounter++}`,
          title: 'DOM Query Executed Inside Loop',
          category: 'DOM Operations',
          severity: 'High',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Executing DOM queries inside loops causes layout thrashing and redundant DOM tree traversals.',
          suggestedReview: 'Cache DOM lookups outside the loop or query once with querySelectorAll into an array.',
          confidence: 'High confidence'
        });
      }

      // 2. Un-throttled high frequency event listeners (scroll, mousemove, resize)
      if (/\.addEventListener\s*\(\s*['"](scroll|mousemove|resize|wheel)['"]/.test(cleanLine)) {
        if (!/throttle|debounce|requestAnimationFrame/i.test(file.content || '')) {
          concerns.push({
            id: `perf_${idCounter++}`,
            title: `Un-throttled '${cleanLine.match(/['"](scroll|mousemove|resize|wheel)['"]/)?.[1]}' Event Listener`,
            category: 'Event Handlers',
            severity: 'Medium',
            file: file.path,
            line: lineNum,
            codeSnippet: cleanLine,
            reason: 'High-frequency events can fire 60+ times per second, causing UI stutter if handlers perform non-trivial DOM or state updates.',
            suggestedReview: 'Wrap the event listener callback in requestAnimationFrame, throttle(), or debounce().',
            confidence: 'Medium confidence'
          });
        }
      }

      // 3. MutationObserver on large DOM subtrees
      if (/new\s+MutationObserver/.test(cleanLine) && file.content?.includes('subtree: true')) {
        concerns.push({
          id: `perf_${idCounter++}`,
          title: 'MutationObserver Active on Broad Subtree',
          category: 'DOM Operations',
          severity: 'Medium',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Observing large DOM subtrees with subtree:true generates high mutation traffic and observer callback overhead.',
          suggestedReview: 'Narrow the target element observer root and specify attributeFilter where possible.',
          confidence: 'Medium confidence'
        });
      }

      // 4. Synchronous File IO on server (fs.readFileSync / writeFileSync)
      if (/\bfs\.(?:readFileSync|writeFileSync|statSync|existsSync)\s*\(/.test(cleanLine)) {
        concerns.push({
          id: `perf_${idCounter++}`,
          title: 'Synchronous I/O Operation (Blocking Event Loop)',
          category: 'Memory',
          severity: 'Medium',
          file: file.path,
          line: lineNum,
          codeSnippet: cleanLine,
          reason: 'Synchronous fs methods block the Node.js event loop, preventing incoming HTTP requests from being handled concurrently.',
          suggestedReview: 'Migrate to asynchronous fs.promises or callback-based I/O.',
          confidence: 'High confidence'
        });
      }
    });
  }

  return concerns;
}
