



"use client"

import { useState, useEffect } from 'react';
import { CodeEditor, type CodeEditorProps } from './Editor/CodeEditor';
import { LanguageSelector } from './Editor/LanguageSelector';
import { OutputTerminal } from './Editor/OutputTerminal';
import { SUPPORTED_LANGUAGES } from '@/lib/constants/language';
// import { Play } from 'lucide-react';
import Script from 'next/script';
import { ArrowLeft, Play, Terminal } from 'lucide-react';
import Link from 'next/link';
import QuestionForm from '../mentor_ship/QuestionForm';
import { checkUser } from '@/lib/checkUser';


declare global {
    interface Window {
      loadPyodide: any;
    }
  }

 export function Playground({ userId }: { userId: string }) {
  const [language, setLanguage] = useState<string>(SUPPORTED_LANGUAGES[0].id);
  const [code, setCode] = useState<string>(SUPPORTED_LANGUAGES[0].template);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  



//   useEffect(() => {
//     // Add pyodide to window object
//     window.loadPyodide = window.loadPyodide || { loaded: false };
//   }, []);

const handleTextSelection =  (text: string) => {
    setSelectedText(text);
  };

const executeJavaScript = async (code: string) => {
    const consoleOutput: string[] = [];
    const originalConsole = { ...console };
    
    try {
      console.log = (...args) => {
        consoleOutput.push(args.join(' '));
        originalConsole.log(...args);
      };
      
      const result = await eval(`(async () => { ${code} })()`);
      return consoleOutput.join('\n') + (result ? `\n${result}` : '');
    } finally {
      console.log = originalConsole.log;
    }
  };

  const executePython = async (code: string) => {
    try {
      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
        stdout: (output: string) => {
          setOutput(prev => prev + output + '\n');
        },
        stderr: (error: string) => {
          setOutput(prev => prev + 'Error: ' + error + '\n');
        }
      });
      
      await pyodide.loadPackagesFromImports(code);
      const result = await pyodide.runPythonAsync(code);
      return result?.toString() || '';
    } catch (error) {
      throw new Error(`Python execution error: ${error}`);
    }
  };

  const executeTypeScript = async (code: string) => {
    // Convert TypeScript to JavaScript
    try {
      const jsCode = `
        try {
          ${code}
        } catch (error) {
          console.error(error);
        }
      `;
      return await executeJavaScript(jsCode);
    } catch (error) {
      throw new Error(`TypeScript execution error: ${error}`);
    }
  };

  const handleRun = async () => {
    setLoading(true);
    setOutput('');

    try {
      let result = '';
      
      switch (language) {
        case 'javascript':
          result = await executeJavaScript(code);
          break;
        case 'python':
          result = await executePython(code);
          break;
        case 'typescript':
          result = await executeTypeScript(code);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      setOutput(prev => prev + result);
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  

return (
    <div className="min-h-screen  text-white flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-gray-800 px-6 h-12 flex items-center justify-between shadow-md sticky top-0 z-50">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Code Playground</span>
        </div>
      </nav>
  
      {/* Main Content */}
      <div className="flex-1 flex flex-col mx-12 my-4">
        {/* Toolbar */}
        <div className="border border-gray-800 shadow-sm rounded-lg mb-4">
          <div className="flex items-center justify-between px-6 h-12">
            <LanguageSelector 
              value={language} 
              onChange={(value) => {
                setLanguage(value);
                setCode(SUPPORTED_LANGUAGES.find(lang => lang.id === value)?.template || '');
              }} 
            />
            <button
              onClick={handleRun}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>
        </div>
  
        {/* Editor and Sidebar Layout */}
        <div className="flex-1 flex gap-6">
          {/* Main Editor Section */}
          <div className="flex-[3] flex flex-col gap-6">
            {/* Code Editor */}
            <div className="flex-[2] rounded-lg border border-gray-800 overflow-hidden bg-[#1e1e1e] shadow-xl">
              <div className="bg-[#252526] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-medium">
                  {SUPPORTED_LANGUAGES.find(lang => lang.id === language)?.name || 'Editor'}
                </span>
              </div>
              <div className="h-[calc(100%-40px)]">
                <CodeEditor
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onSelect={handleTextSelection}
                />
              </div>
            </div>
  
            {/* Terminal Output */}
            <div className="h-[300px]">
              <OutputTerminal output={output} />
            </div>
          </div>
  
          {/* Question Form Sidebar */}
          <div className="w-[400px] border-l border-gray-800 bg-[#252526] rounded-lg shadow-xl">
            <div className="p-6 sticky top-0">
              <QuestionForm 
                userId={userId}
                selectedText={selectedText}
              />
            </div>
          </div>
        </div>
      </div>
  
      <Script 
        strategy="beforeInteractive"
        src="https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js"
      />
    </div>
  );
}