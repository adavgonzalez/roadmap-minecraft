import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const S = {
  wrapper: {
    color: '#b8cfe8', fontSize: 13, lineHeight: 1.65,
  },
  h1: { color: '#f0f4fa', fontSize: 16, fontWeight: 700, margin: '14px 0 6px', borderBottom: '1px solid #1c2b3f', paddingBottom: 5 },
  h2: { color: '#f0f4fa', fontSize: 15, fontWeight: 700, margin: '12px 0 5px' },
  h3: { color: '#e2e8f0', fontSize: 14, fontWeight: 600, margin: '10px 0 4px' },
  p:  { margin: '6px 0' },
  ul: { margin: '6px 0', paddingLeft: 18 },
  ol: { margin: '6px 0', paddingLeft: 18 },
  li: { margin: '3px 0', lineHeight: 1.5 },
  a:  { color: '#60a5fa', textDecoration: 'none', borderBottom: '1px solid #60a5fa40' },
  strong: { color: '#f0f4fa', fontWeight: 700 },
  em: { color: '#c4d4e8', fontStyle: 'italic' },
  hr: { border: 'none', borderTop: '1px solid #1c2b3f', margin: '12px 0' },
  blockquote: {
    borderLeft: '3px solid #3b82f6', paddingLeft: 12,
    margin: '8px 0', color: '#7a9ab8', fontStyle: 'italic',
  },
  inlineCode: {
    background: '#0f2035', color: '#a5f3fc',
    padding: '1px 6px', borderRadius: 4,
    fontFamily: "'Fira Code', 'Cascadia Code', monospace", fontSize: 12,
    border: '1px solid #1c3a50',
  },
  pre: {
    background: '#060d18', border: '1px solid #1c2b3f',
    borderRadius: 7, padding: '12px 16px', overflowX: 'auto',
    margin: '10px 0',
  },
  preCode: {
    color: '#a5f3fc',
    fontFamily: "'Fira Code', 'Cascadia Code', monospace",
    fontSize: 12, lineHeight: 1.6,
  },
  table: { borderCollapse: 'collapse', width: '100%', margin: '10px 0', fontSize: 12 },
  th: {
    background: '#1c2b3f', padding: '6px 12px',
    textAlign: 'left', color: '#f0f4fa', fontWeight: 600,
    border: '1px solid #263548',
  },
  td: { padding: '5px 12px', border: '1px solid #1c2b3f', color: '#b8cfe8' },
  trEven: { background: '#0e1a28' },
}

const components = {
  h1:         ({ children }) => <h1 style={S.h1}>{children}</h1>,
  h2:         ({ children }) => <h2 style={S.h2}>{children}</h2>,
  h3:         ({ children }) => <h3 style={S.h3}>{children}</h3>,
  p:          ({ children }) => <p style={S.p}>{children}</p>,
  ul:         ({ children }) => <ul style={S.ul}>{children}</ul>,
  ol:         ({ children }) => <ol style={S.ol}>{children}</ol>,
  li:         ({ children }) => <li style={S.li}>{children}</li>,
  strong:     ({ children }) => <strong style={S.strong}>{children}</strong>,
  em:         ({ children }) => <em style={S.em}>{children}</em>,
  hr:         ()              => <hr style={S.hr} />,
  blockquote: ({ children }) => <blockquote style={S.blockquote}>{children}</blockquote>,
  a:          ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" style={S.a}
      onMouseEnter={e => e.currentTarget.style.color='#93c5fd'}
      onMouseLeave={e => e.currentTarget.style.color='#60a5fa'}>
      {children}
    </a>
  ),
  code: ({ inline, children }) =>
    inline
      ? <code style={S.inlineCode}>{children}</code>
      : <code style={S.preCode}>{children}</code>,
  pre: ({ children }) => <pre style={S.pre}>{children}</pre>,
  table: ({ children }) => <table style={S.table}>{children}</table>,
  th:    ({ children }) => <th style={S.th}>{children}</th>,
  td:    ({ children }) => <td style={S.td}>{children}</td>,
}

export default function MarkdownRenderer({ content }) {
  if (!content?.trim()) return null
  return (
    <div style={S.wrapper}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
