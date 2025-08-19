import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `- Start small: records, DUs, Option/Result, and the pipe (|>)—you don’t need advanced FP
- Where it shines: small APIs, ETL/data wrangling, and cloud/serverless functions
- Interop is seamless: use any .NET library, return Task, serialize records with System.Text.Json
- Functional core, imperative shell: pure logic in the middle, I/O at the edges
- Ship like normal .NET: dotnet CLI, containers, CI/CD, Azure/AWS/GCP

\`\`\`fsharp
// Lean API handler using records, DU validation, and Result -> HTTP
open System
open Microsoft.AspNetCore.Http

type Email = private Email of string
module Email =
  let tryCreate s =
    if String.IsNullOrWhiteSpace s || not (s.Contains "@") then Error "Invalid email"
    else Ok (Email s)

let subscribe (email:string) : IResult =
  email.Trim().ToLowerInvariant()
  |> Email.tryCreate
  |> function
     | Ok _ -> Results.NoContent()
     | Error e -> Results.BadRequest(e)
\`\`\`

\`\`\`fsharp
// ETL: strongly-typed CSV with a tiny script
open FSharp.Data

type Sales = CsvProvider<"date,amount\n2024-01-01,42.50">
let total path =
  let csv = Sales.Load(path)
  csv.Rows |> Seq.sumBy (fun r -> r.Amount) |> printfn "Total: %M"
\`\`\`

\`\`\`fsharp
// Cloud function (Azure Functions isolated worker)
open System.Net
open Microsoft.Azure.Functions.Worker
open Microsoft.Azure.Functions.Worker.Http

type Functions() =
  [<Function("Ping")>]
  member _.Ping([<HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "ping")>] req: HttpRequestData) =
    task {
      let res = req.CreateResponse(HttpStatusCode.OK)
      res.WriteString("pong")
      return res
    }
\`\`\`

\`\`\`mermaid
flowchart TD
A["Pick one small use case"] --> B["Model with records + DUs"]
B --> C["Handle with Option/Result + pattern match"]
C --> D["Pipe transformations (|>)"]
D --> E["Deploy as API / ETL / Function"]
\`\`\``;
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
      <h1>How to start today and where F# shines: APIs, ETL, cloud functions — key takeaways</h1>
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