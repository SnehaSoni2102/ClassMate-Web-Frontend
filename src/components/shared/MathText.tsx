import React from 'react';
import { MathJax } from 'better-react-mathjax';
import { processMathContent } from '@/lib/utils/math';
import { cn } from '@/lib/utils';

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

export const MathText: React.FC<MathTextProps> = ({ text, className, inline = true }) => {
  const processedText = processMathContent(text);
  
  return (
    <MathJax className={cn(inline ? "inline-block" : "block", className)} inline={inline}>
      {processedText}
    </MathJax>
  );
};
