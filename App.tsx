
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { checkGrammar, translateText } from './services/geminiService';
import type { GrammarError, TranslationResult } from './types';
import { ActiveTab } from './types';
import { LANGUAGES } from './constants';
import Loader from './components/Loader';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import SuggestionsModal from './components/SuggestionsModal';

const App: React.FC = () => {
  const [editorHtml, setEditorHtml] = useState<string>('');
  const [grammarErrors, setGrammarErrors] = useState<GrammarError[]>([]);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.Grammar);
  const [targetLanguage, setTargetLanguage] = useState<string>(LANGUAGES[0]);
  const [activeError, setActiveError] = useState<GrammarError | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');

  const cleanHtmlForApi = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html.replace(/<span class="error".*?>(.*?)<\/span>/g, '$1');
    return tempDiv.innerText || '';
  };
  
  const handleCheckGrammar = useCallback(async () => {
    const text = cleanHtmlForApi(editorHtml);
    if (!text.trim()) return;
    setIsLoading(true);
    setGrammarErrors([]);
    const errors = await checkGrammar(text);
    setGrammarErrors(errors);
    
    let currentHtml = editorHtml;
    errors.forEach((error, index) => {
      const regex = new RegExp(`\\b${error.errorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if(currentHtml.match(regex)){
          currentHtml = currentHtml.replace(regex, `<span class="error bg-red-100 text-red-700 cursor-pointer rounded px-1 py-0.5" data-error-index="${index}">${error.errorText}</span>`);
      }
    });

    setEditorHtml(currentHtml);
    setIsLoading(false);
  }, [editorHtml]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('error')) {
            const index = parseInt(target.getAttribute('data-error-index') || '0', 10);
            if (grammarErrors[index]) {
                setActiveError(grammarErrors[index]);
            }
        }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [grammarErrors]);


  const handleTranslate = useCallback(async () => {
    const text = cleanHtmlForApi(editorHtml);
    if (!text.trim()) return;
    setIsLoading(true);
    setTranslationResult(null);
    const result = await translateText(text, targetLanguage);
    setTranslationResult(result);
    setIsLoading(false);
  }, [editorHtml, targetLanguage]);

  const handleSuggestionSelect = (suggestion: string) => {
    if (!activeError) return;
    const newHtml = editorHtml.replace(
        new RegExp(`<span class="error.*?data-error-index="${grammarErrors.indexOf(activeError)}".*?>${activeError.errorText}</span>`, 'i'),
        suggestion
    );
    setEditorHtml(newHtml);
    setActiveError(null);
    // Optionally re-check grammar after a correction
    // handleCheckGrammar(); 
  };
  
  const handleFormat = (command: 'font' | 'color' | 'highlight', value: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const selectedContent = range.extractContents();
    const span = document.createElement('span');

    switch (command) {
        case 'font':
            span.style.fontFamily = value;
            break;
        case 'color':
            span.style.color = value;
            break;
        case 'highlight':
            span.style.backgroundColor = value;
            break;
    }

    span.appendChild(selectedContent);
    range.insertNode(span);
    
    // Update state from the source of truth - the editor itself
    if (editorRef.current) {
        setEditorHtml(editorRef.current.innerHTML);
    }
    selection.removeAllRanges();
  };

  const Sidebar = () => (
    <div className="w-full lg:w-1/3 xl:w-1/4 p-4 bg-gray-50 border-l border-gray-200 flex flex-col space-y-4">
        <div className="flex border-b border-gray-200">
            <button onClick={() => setActiveTab(ActiveTab.Grammar)} className={`flex-1 p-2 text-sm font-medium ${activeTab === ActiveTab.Grammar ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Grammar</button>
            <button onClick={() => setActiveTab(ActiveTab.Translate)} className={`flex-1 p-2 text-sm font-medium ${activeTab === ActiveTab.Translate ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}>Translate</button>
        </div>
        
        {activeTab === ActiveTab.Grammar && (
            <div>
                <button onClick={handleCheckGrammar} disabled={isLoading} className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
                    {isLoading ? 'Checking...' : 'Check Grammar'}
                </button>
                <div className="mt-4 space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoading && <Loader />}
                    {grammarErrors.length > 0 && <p className="text-sm font-semibold">{grammarErrors.length} suggestions found</p>}
                    {grammarErrors.map((error, index) => (
                        <div key={index} className="p-3 bg-white border rounded-md cursor-pointer hover:border-blue-400" onClick={() => setActiveError(error)}>
                            <p className="text-sm text-red-600 line-through">{error.errorText}</p>
                            <p className="text-sm text-green-700">{error.suggestions[0]}</p>
                            <p className="text-xs text-gray-500 mt-1">{error.explanation}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {activeTab === ActiveTab.Translate && (
             <div>
                <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md mb-2">
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
                <button onClick={handleTranslate} disabled={isLoading} className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors">
                    {isLoading ? 'Translating...' : 'Translate'}
                </button>
                <div className="mt-4 space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto">
                    {isLoading && <Loader />}
                    {translationResult && (
                        <>
                            <div className="p-3 bg-white border rounded-md">
                                <h4 className="font-semibold text-gray-700">Direct Translation</h4>
                                <p className="text-sm text-gray-600 mt-1">{translationResult.directTranslation}</p>
                            </div>
                            <div className="p-3 bg-white border border-green-300 rounded-md">
                                <h4 className="font-semibold text-gray-700 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Improved Version
                                </h4>
                                <p className="text-sm text-gray-800 mt-1">{translationResult.improvedTranslation}</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {activeError && <SuggestionsModal error={activeError} onClose={() => setActiveError(null)} onSelect={handleSuggestionSelect} />}
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center">AI Text Pro</h1>
      </header>
      <main className="flex flex-col lg:flex-row p-4 gap-4">
        <div className="flex-grow bg-white rounded-lg shadow-md">
            <Toolbar onFormat={handleFormat} />
            <div ref={editorRef} className="h-full">
              <Editor 
                html={editorHtml}
                onHtmlChange={setEditorHtml}
                onTextSelect={setSelectedText}
                placeholder="Start writing your draft here..."
              />
            </div>
        </div>
        <Sidebar />
      </main>
    </div>
  );
};

export default App;
