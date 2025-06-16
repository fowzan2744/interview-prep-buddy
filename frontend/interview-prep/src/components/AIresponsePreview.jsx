import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LuCopy, LuCheck, LuCode } from 'react-icons/lu';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AIResponsePreview = ({ content }) => {
  if (!content) {
    return (
      <div className="p-4 text-gray-500 italic">
        No content to display
      </div>
    );
  }

  // Convert escaped newlines back to actual newlines
  const processContent = (text) => {
    return text
      .replace(/\\n/g, '\n')           // Convert \n to actual newlines
      .replace(/\\"/g, '"')            // Convert \" to actual quotes
      .replace(/\\t/g, '\t')           // Convert \t to actual tabs
      .replace(/\\r/g, '\r')           // Convert \r to carriage returns
      .replace(/\\\\/g, '\\');         // Convert \\ to single backslash
  };

  const processedContent = processContent(content);

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';
              const isInline = !className || className.includes('inline');
              
              return !isInline ? (
                <CodeBlock
                  code={String(children).replace(/\n$/, '')}
                  language={language}
                />
              ) : (
                <code className="bg-gray-100 px-2 py-1 rounded-md text-sm font-mono">
                  {children}
                </code>
              );
            },
            p({ children }) {
              return <p className="mb-4 leading-relaxed">{children}</p>;
            },
            strong({ children }) {
              return <strong className="font-semibold text-gray-900">{children}</strong>;
            },
            em({ children }) {
              return <em className="italic">{children}</em>;
            },
            ul({ children }) {
              return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
            },
            li({ children }) {
              return <li className="mb-1">{children}</li>;
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-4 border-blue-500 pl-4 mb-4 bg-blue-50 py-2 rounded-r-md">
                  {children}
                </blockquote>
              );
            },
            h1({ children }) {
              return <h1 className="text-3xl font-bold mb-6 text-gray-900">{children}</h1>;
            },
            h2({ children }) {
              return <h2 className="text-2xl font-bold mb-4 text-gray-900">{children}</h2>;
            },
            h3({ children }) {
              return <h3 className="text-xl font-bold mb-4 text-gray-900">{children}</h3>;
            },
            h4({ children }) {
              return <h4 className="text-lg font-bold mb-3 text-gray-900">{children}</h4>;
            },
            h5({ children }) {
              return <h5 className="text-base font-bold mb-3 text-gray-900">{children}</h5>;
            },
            h6({ children }) {
              return <h6 className="text-sm font-bold mb-3 text-gray-900">{children}</h6>;
            },
            a({ href, children }) {
              return (
                <a 
                  href={href} 
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto mb-4">
                  <table className="table-auto border-collapse border border-gray-300 w-full">
                    {children}
                  </table>
                </div>
              );
            },
            thead({ children }) {
              return <thead className="bg-gray-100">{children}</thead>;
            },
            tbody({ children }) {
              return <tbody>{children}</tbody>;
            },
            tr({ children }) {
              return <tr className="border-b border-gray-300 hover:bg-gray-50">{children}</tr>;
            },
            th({ children }) {
              return <th className="px-4 py-3 text-left font-semibold">{children}</th>;
            },
            td({ children }) {
              return <td className="px-4 py-3">{children}</td>;
            },
            hr() {
              return <hr className="my-6 border-gray-300" />;
            },
            img({ src, alt }) {
              return (
                <img 
                  src={src} 
                  alt={alt} 
                  className="mb-4 max-w-full h-auto rounded-lg shadow-sm" 
                />
              );
            }
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center">
          <LuCode size={16} className="mr-2 text-gray-600" />
          <span className="text-sm font-semibold text-gray-700 capitalize">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={copyCode}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <>
              <LuCheck size={16} className="mr-1" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <LuCopy size={16} className="mr-1" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneLight}
        customStyle={{
          fontSize: '14px',
          padding: '16px',
          margin: 0,
          background: 'transparent',
          borderRadius: '0',
        }}
        showLineNumbers={code.split('\n').length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default AIResponsePreview;