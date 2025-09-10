
import React, { useRef, useEffect } from 'react';

interface EditorProps {
  html: string;
  onHtmlChange: (html: string) => void;
  onTextSelect: (text: string) => void;
  placeholder?: string;
}

const Editor: React.FC<EditorProps> = ({ html, onHtmlChange, onTextSelect, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== html) {
      editor.innerHTML = html;
    }
  }, [html]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onHtmlChange(e.currentTarget.innerHTML);
  };
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if(selection) {
        onTextSelect(selection.toString());
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onInput={handleInput}
      onMouseUp={handleMouseUp}
      className="w-full h-full p-6 text-lg bg-white rounded-b-lg focus:outline-none overflow-y-auto"
      style={{ minHeight: 'calc(100vh - 200px)', fontFamily: '"Inter", sans-serif' }}
      data-placeholder={placeholder}
    />
  );
};

export default Editor;
