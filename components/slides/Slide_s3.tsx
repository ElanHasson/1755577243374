import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function Slide() {
  const markdown = `**What we’ll model (plain English)**
- Registration has two states: Pending and Confirmed
- Emails are validated up front—no nulls, no "stringly-typed" bugs
- Business rules expressed with Result for clear success/failure
- Pattern matching enforces handling every case

\`\`\`fsharp
// Domain errors we expect (no exceptions for control flow)
type DomainError =
  | InvalidEmail
  | AlreadyConfirmed

// Email as a single-case DU with a safe constructor
type Email = private Email of string
module Email =
  let value (Email e) = e
  let tryCreate (s: string) : Result<Email, DomainError> =
    if System.String.IsNullOrWhiteSpace s || not (s.Contains "@") then Error InvalidEmail
    else Ok (Email s)

// Registration lifecycle modeled as a DU
type Registration =
  | Pending of email: Email
  | Confirmed of email: Email * confirmedAt: System.DateTime

module Registration =
  // Create a Pending registration if the email is valid
  let register (rawEmail: string) : Result<Registration, DomainError> =
    rawEmail |> Email.tryCreate |> Result.map Pending

  // Business rule: only Pending can become Confirmed
  let confirm (now: System.DateTime) (reg: Registration) : Result<Registration, DomainError> =
    match reg with
    | Pending e -> Ok (Confirmed (e, now))
    | Confirmed _ -> Error AlreadyConfirmed

// Example flow
let now = System.DateTime.UtcNow
let outcome =
  "ada@example.com"
  |> Registration.register
  |> Result.bind (Registration.confirm now)

let message =
  match outcome with
  | Ok (Registration.Confirmed (e, at)) -> $"Confirmed {Email.value e} at {at:O}"
  | Error InvalidEmail -> "Please enter a valid email."
  | Error AlreadyConfirmed -> "This link was already used."
\`\`\`

\`\`\`mermaid
flowchart TD
  User[User] --> Enter["Enter email"]
  Enter --> Validate["Email.tryCreate"]
  Validate -->|Ok Email| MkPending["Registration.Pending"]
  Validate -->|Error InvalidEmail| FailInvalid["Stop: show validation error"]
  MkPending --> Click["Confirm link clicked"]
  Click --> Confirm["Registration.confirm"]
  Confirm -->|Ok Confirmed| Done["Registration.Confirmed"]
  Confirm -->|Error AlreadyConfirmed| FailAlready["Stop: already confirmed"]
\`\`\`

**Why this helps in .NET apps**
- Invalid states are unrepresentable; fewer runtime bugs
- Clear, compiler-checked errors with Result instead of exceptions
- Interop-friendly: pure functions you can call from C# or F#`;
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
      <h1>Model real business rules with records, discriminated unions, and Result (registration workflow)</h1>
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