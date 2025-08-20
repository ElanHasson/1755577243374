import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

export default function Slide() {
  const markdown = `**Why task {} for async in F#**
- task creates real .NET Task values: awaitable in C#, perfect interop
- Use a single HttpClient instance; add CancellationToken in your API
- Reads like straightforward imperative code, without callbacks
- Return Task<'T> so ASP.NET/C# callers can await immediately

\`\`\`fsharp
module HttpDemo
open System
open System.Net.Http
open System.Text.Json
open System.Threading
open System.Threading.Tasks

let http =
    let c = new HttpClient()
    c.DefaultRequestHeaders.UserAgent.ParseAdd("FSharpDemo/1.0")
    c.DefaultRequestHeaders.Accept.ParseAdd("application/json")
    c

let fetchStars (repo: string) (ct: CancellationToken) : Task<int> =
    task {
        let url = $"https://api.github.com/repos/%s{repo}"
        use! resp = http.GetAsync(url, ct)
        resp.EnsureSuccessStatusCode()
        use! stream = resp.Content.ReadAsStreamAsync(ct)
        let! doc = JsonDocument.ParseAsync(stream, cancellationToken = ct)
        return doc.RootElement.GetProperty("stargazers_count").GetInt32()
    }

let demo ct = task {
    let! stars = fetchStars "dotnet/fsharp" ct
    return $"F# repo stars: {stars}"
}
\`\`\`

\`\`\`csharp
// From C# — interop-friendly
var stars = await HttpDemo.fetchStars("dotnet/fsharp", ct);
\`\`\`

\`\`\`mermaid
sequenceDiagram
  participant User
  participant FSharp as FSharp task function
  participant HttpClient
  participant CSharp as CSharp caller
  User->>FSharp: fetchStars(repo, ct)
  FSharp->>HttpClient: GetAsync(url, ct)
  HttpClient-->>FSharp: HttpResponseMessage
  FSharp-->>CSharp: Task<int>
\`\`\``;
  
  return (
    <div className="slide markdown-slide">
      <h1>Async without fuss using task and HttpClient (interop-friendly)</h1>
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