"We are building ThinkTank (T.T.), a Quality-First Interceptor for AI platforms. We prioritize Resilience (no brittle selectors), Privacy (Local-First ML), and Integrity (Adversarial Socratic Logic). Do not provide 'Standard' extension boilerplates; provide an enterprise-grade, isolated architecture using a Shadow DOM and MutationObservers."

## Non-Negotiable Constraints

### 1. "No Brittle Selectors" (The UI Constraint)
- **Directive**: Do not use hard-coded CSS classes like `.chat-bubble` or `#send-button`. Use Agnostic DOM Traversal.
- **Why**: OpenAI changes these classes weekly.
- **Instruction**: Find the chat container by searching for elements that contain high-density text updates or specific ARIA labels. Use a MutationObserver that looks for changes in the DOM, not static IDs.

### 2. "Local-First Execution" (The Privacy Constraint)
- **Directive**: The 'Human Pulse' analysis must happen in the Content Script or Background Service Worker using WebGPU/WASM. Do not send user drafts to an external API for the initial scoring.
- **Why**: If you send every keystroke to your server, you'll go broke on API costs and lose user trust.
- **Instruction**: Use Transformers.js to load a quantized detection model locally. Ensure all PII (Personally Identifiable Information) stays on the client-side.

### 3. "Shadow DOM Encapsulation" (The Stealth Constraint)
- **Directive**: Inject the T.T. UI (the Meter and the Socratic Box) using a Shadow DOM.
- **Why**: This "hides" your extension's CSS and HTML from the host website (ChatGPT).
- **Instruction**: Isolate the T.T. styles so ChatGPT’s global CSS doesn't break our layout, and their anti-extension scripts can't easily 'see' or manipulate our buttons.

### 4. "The Recursive Loop Protection" (The Logic Constraint)
- **Directive**: The Socratic Module must be State-Aware. It cannot accept an answer that has a lower 'Human Pulse' than the original AI text.
- **Why**: This prevents users from using "AI to answer the AI."
- **Instruction**: Compare the Vector Embeddings of the user’s 'Spark' against the AI’s original response. If the similarity score is too high (>0.85), reject the Spark as 'Generic' and re-prompt the user.
