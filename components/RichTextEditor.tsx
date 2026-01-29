import React, { useRef, useEffect } from 'react';
import { Bold, Italic, List, Link, AlignLeft, AlignCenter, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, label }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
        onChange(contentRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-slate-300 rounded-md shadow-sm overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      <div className="bg-slate-50 border-b border-slate-200 px-2 py-1 flex items-center space-x-1">
        <button type="button" onClick={() => execCommand('bold')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Bold">
            <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('italic')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Italic">
            <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('justifyLeft')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Align Left">
            <AlignLeft className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Align Center">
            <AlignCenter className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Bullet List">
            <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => {
            const url = prompt('Enter URL:');
            if(url) execCommand('createLink', url);
        }} className="p-1.5 rounded hover:bg-slate-200 text-slate-600" title="Link">
            <Link className="w-4 h-4" />
        </button>
        <div className="flex-1 text-right text-xs text-slate-400 font-medium px-2">{label}</div>
      </div>
      
      <div
        ref={contentRef}
        contentEditable
        className="min-h-[150px] max-h-[300px] overflow-y-auto p-3 text-sm text-slate-800 focus:outline-none prose prose-sm max-w-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
};

export default RichTextEditor;