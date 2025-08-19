import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Full .NET interop: call System.Text.Json, HttpClient, EF/Dapper, Serilog; return Task for C# callers; runs on Windows/Mac/Linux
- ASP.NET Core: minimal APIs or Giraffe; deploy like any .NET service or container
- Tooling: VS Code + Ionide or Visual Studio; format with Fantomas; build/test with dotnet CLI
- Serverless: Azure Functions isolated worker pairs well with task { } and immutable records
\`\`\`fsharp
// Minimal API (ASP.NET Core) + JSON interop
open System
open System.Text.Json
open Microsoft.AspNetCore.Builder

type Todo = { id:int; title:string }
let builder = WebApplication.CreateBuilder()
let app = builder.Build()
app.MapGet("/todo", Func<Todo>(fun () -> { id=1; title="Learn F#" })) |> ignore
let json = JsonSerializer.Serialize { id=1; title="Learn F#" }
app.Run()
\`\`\`
\`\`\`fsharp
// Azure Functions (isolated)
module Functions
open Microsoft.Azure.Functions.Worker
open Microsoft.Azure.Functions.Worker.Http
open System.Net

[<Function("Ping")>]
let run([<HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ping")>] req: HttpRequestData) =
  task {
    let res = req.CreateResponse(HttpStatusCode.OK)
    do! res.WriteStringAsync "pong"
    return res
  }
\`\`\`
\`\`\`mermaid
flowchart LR
FSharp["F# code"] --> Libs[".NET libraries"]
Libs --> Api["ASP.NET Core service"]
Libs --> Fx["Azure Functions (isolated)"]
Libs --> Cli["Console/CLI & containers"]
Tooling["Ionide/VS + Fantomas"] --> FSharp
\`\`\`
`;
  const mermaidRef = useRef(0);
  
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#667eea',
        primaryTextColor: '#fff',
        primaryBorderColor: '#7c3aed',
        lineColor: '#5a67d8',
        secondaryColor: '#764ba2',
        tertiaryColor: '#667eea',
        background: '#1a202c',
        mainBkg: '#2d3748',
        secondBkg: '#4a5568',
        tertiaryBkg: '#718096',
        textColor: '#fff',
        nodeTextColor: '#fff',
      }
    });
    
    // Find and render mermaid diagrams
    const renderDiagrams = async () => {
      const diagrams = document.querySelectorAll('.language-mermaid');
      for (let i = 0; i < diagrams.length; i++) {
        const element = diagrams[i];
        const graphDefinition = element.textContent;
        const id = `mermaid-${mermaidRef.current++}`;
        
        try {
          const { svg } = await mermaid.render(id, graphDefinition);
          element.innerHTML = svg;
          element.classList.remove('language-mermaid');
          element.classList.add('mermaid-rendered');
        } catch (error) {
          console.error('Mermaid rendering error:', error);
        }
      }
    };
    
    renderDiagrams();
  }, [markdown]);
  
  return (
    <div className="slide markdown-slide">
      <h1>.NET interop and tooling snapshot: libraries, ASP.NET Core, Ionide/VS, Fantomas, Functions</h1>
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
                <pre className="language-mermaid">
                  <code>{String(children).replace(/\n$/, '')}</code>
                </pre>
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