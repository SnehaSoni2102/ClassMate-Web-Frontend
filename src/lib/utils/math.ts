
/**
 * Helper to process content that might be raw LaTeX
 * It wraps raw LaTeX content in delimiters so MathJax can render it
 */
export const processMathContent = (text: string) => {
  if (!text) return "";
  
  // Check if text already contains delimiters
  if (text.match(/(\$|\\\(|\\\[)/)) {
    return text;
  }

  // Check for strong math indicators or if it starts with a backslash
  const mathIndicators = [
    '\\frac', '\\int', '\\sum', '\\sqrt', '\\begin', 
    '\\cos', '\\sin', '\\tan', '\\cot', '\\sec', '\\csc', 
    '\\log', '\\ln', '\\lim', '\\alpha', '\\beta', '\\gamma', 
    '\\theta', '\\pi', '\\infty', '\\partial', '\\cdot', '\\times'
  ];
  
  const hasIndicator = mathIndicators.some(indicator => text.includes(indicator));
  const startsWithSlash = text.trim().startsWith('\\');

  // If it looks like LaTeX, wrap it in inline math delimiters
  if (startsWithSlash || hasIndicator) {
    return `\\(${text}\\)`;
  }
  
  return text;
};
