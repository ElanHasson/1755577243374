import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from '../../components/Mermaid';

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