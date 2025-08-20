import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Immutability by default: fewer side effects and easier reasoning
- Strong types without noise: type inference reduces boilerplate
- Records + Unions: model real cases; make invalid states unrepresentable
- Pattern matching: handle every case clearly; compiler checks exhaustiveness
- Option/Result + pipes: replace nulls/exceptions; read code top-to-bottom

\`\`\`fsharp
type Customer = { Id: int; Email: string } // record; immutable, inferred
type Payment = | Card of last4:string | Cash // union

let describe p =
  match p with
  | Card last4 -> $"Card ****{last4}"
  | Cash -> "Cash"

let toResult err opt = match opt with Some v -> Ok v | None -> Error err

let confirm id rawEmail payment =
  rawEmail
  |> Option.ofObj               // null -> None
  |> Option.filter (fun s -> s.Contains "@")
  |> toResult "Invalid email"   // Option -> Result
  |> Result.map (fun email -> { Id = id; Email = email })
  |> Result.map (fun c -> $"{c.Id}: {describe payment} to {c.Email}")
\`\`\`

\`\`\`mermaid
flowchart LR
  A["rawEmail (possibly null)"] --> B["Option.ofObj"]
  B --> C["filter contains '@'"]
  C --> D["toResult 'Invalid email'"]
  D -->|Ok| E["create record + describe payment"]
  D -->|Error| F["error message"]
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Core ideas in plain English: immutability, type inference, records, unions, pattern matching, options/results, and pipes</h1>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            // Handle inline code
            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            // Handle mermaid diagrams
            if (language === 'mermaid') {
              return (
                <Mermaid chart={String(children).replace(/\n$/, '')} />
              );
            }
            
            // Handle code blocks with syntax highlighting
            if (language) {
              return (
                <SyntaxHighlighter
                  language={language}
                  style={atomDark}
                  showLineNumbers={true}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              );
            }
            
            // Default code block without highlighting
            return (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}