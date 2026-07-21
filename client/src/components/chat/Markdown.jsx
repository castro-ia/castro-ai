import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  h1: ({ children }) => <h1 className="mb-2 mt-1 font-display text-base text-white">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-1 font-display text-[15px] text-white">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-1.5 mt-1 text-sm font-semibold text-white">{children}</h3>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-2">
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-black/30 px-1 py-0.5 text-[13px]">{children}</code>
    ) : (
      <code className="block whitespace-pre-wrap text-[13px]">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-xl bg-black/30 p-3 last:mb-0">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-2 border-l-2 border-white/20 pl-3 text-white/70 last:mb-0">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-white/20 px-2 py-1 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-b border-white/10 px-2 py-1 align-top">{children}</td>,
};

export function Markdown({ children }) {
  return (
    <div className="text-[15px] leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
