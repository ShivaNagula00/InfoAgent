// Utility function to format bot responses into structured, professional format
export const formatResponse = (text) => {
  if (!text) return text;

  // Split text by double newlines first, then by single newlines for better paragraph detection
  const sections = text.split(/\n\s*\n/).filter(p => p.trim());
  
  const formattedSections = [];
  let currentCodeBlock = null;
  
  sections.forEach((section, sectionIndex) => {
    const lines = section.split('\n').filter(line => line.trim());
    
    lines.forEach((line, lineIndex) => {
      const trimmed = line.trim();
      const key = `${sectionIndex}-${lineIndex}`;
      
      // Check if it's code (contains common code patterns)
      if (/```|`[^`]+`|function\s+\w+|class\s+\w+|import\s+|from\s+|def\s+\w+|console\.log|print\(|\w+\s*=\s*|\w+\(.*\)|\{|\}|;$/.test(trimmed)) {
        if (!currentCodeBlock) {
          currentCodeBlock = { type: 'code', content: trimmed, key };
        } else {
          currentCodeBlock.content += '\n' + trimmed;
        }
      } else {
        // If we have a code block, push it and reset
        if (currentCodeBlock) {
          formattedSections.push(currentCodeBlock);
          currentCodeBlock = null;
        }
        
        // Check if it's a list item
        if (/^[-*•]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
          formattedSections.push({ type: 'list-item', content: trimmed, key });
        }
        // Check if it's a heading (contains emoji, starts with #, or ends with :)
        else if (/^#+\s/.test(trimmed) || /^[🌍🧠🔒💡⚡📚🎯🚀✨🔧📊🎨💻🌟📝🔍⭐🎪🎭🎨🎯🎪].+/.test(trimmed) || (trimmed.length < 100 && trimmed.endsWith(':'))) {
          const level = trimmed.match(/^#+/) ? trimmed.match(/^#+/)[0].length : 1;
          const content = trimmed.replace(/^#+\s*/, '').replace(/:$/, '');
          formattedSections.push({ type: 'heading', content, level, key });
        }
        // Regular paragraph - split long paragraphs into smaller chunks
        else if (trimmed.length > 0) {
          if (trimmed.length > 200) {
            // Split long paragraphs at sentence boundaries
            const sentences = trimmed.split(/(?<=[.!?])\s+/);
            let currentChunk = '';
            
            sentences.forEach((sentence, sentIndex) => {
              if (currentChunk.length + sentence.length > 200 && currentChunk.length > 0) {
                formattedSections.push({ type: 'paragraph', content: currentChunk.trim(), key: `${key}-${sentIndex}` });
                currentChunk = sentence;
              } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
              }
            });
            
            if (currentChunk.trim()) {
              formattedSections.push({ type: 'paragraph', content: currentChunk.trim(), key: `${key}-final` });
            }
          } else {
            formattedSections.push({ type: 'paragraph', content: trimmed, key });
          }
        }
      }
    });
  });
  
  // Don't forget to push the last code block if it exists
  if (currentCodeBlock) {
    formattedSections.push(currentCodeBlock);
  }
  
  return formattedSections;
};

// Function to detect and format different content types within text
export const formatTextContent = (text) => {
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Handle bold text
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic text
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Handle URLs
  text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return text;
};