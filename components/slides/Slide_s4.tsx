import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `- Why the pipe (|>) matters: top-to-bottom, readable transformations
- Works with any .NET API you already use (File, HttpClient, etc.)
- Convert nulls to Option for safer interop with C#
- Design functions to take the data last for pipe-friendly code

\`\`\`fsharp
// Word count with pipes + .NET APIs
let wordCount path =
    System.IO.File.ReadAllText path
    |> fun text ->
        text.Split(
            [| ' '; '\n'; '\t'; '\r'; '.'; ','; ';'; ':' |],
            System.StringSplitOptions.RemoveEmptyEntries)
    |> Array.length

"README.md"
|> wordCount
|> printfn "Words: %d"
\`\`\`

\`\`\`fsharp
// Safer null interop and headers from HttpClient
open System
open System.Net.Http

let safeLength (maybeNull: string) =
    maybeNull
    |> Option.ofObj            // null -> None, otherwise Some s
    |> Option.map String.length
    |> Option.defaultValue 0

let tryGetHeader (name: string) (headers: Headers.HttpResponseHeaders) =
    match headers.TryGetValues name with
    | true, values -> values |> Seq.tryHead   // string option
    | _ -> None

let safeHeader name (resp: HttpResponseMessage) =
    resp.Headers
    |> tryGetHeader name
    |> Option.defaultValue "<missing>"
\`\`\`

\`\`\`mermaid
flowchart TD
  A["File path"] --> B["System.IO.File.ReadAllText"]
  B --> C["Split by whitespace/punctuation"]
  C --> D["Array.length"]
  D --> E["Print 'Words: N'"]
  F["C# API returns null"] --> G["Option.ofObj"]
  G --> H["Some value"] --> I["Use safely in pipeline"]
  G --> J["None"] --> K["Provide default or log"]
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Readable data transformation with the pipe operator and .NET APIs (word count and safer null interop)</h1>
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