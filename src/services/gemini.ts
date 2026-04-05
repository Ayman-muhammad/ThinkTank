import { GoogleGenAI, Type } from "@google/genai";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const apiKey = process.env.GEMINI_API_KEY;

export interface ForesightReport {
  next_moves: string[];
  potential_risks: string[];
  resource_requirements: string[];
}

export interface MergeResponse {
  refined_text: string;
  quality_score: number;
  human_spark_detected: boolean;
  socratic_follow_up?: string; // For the Socratic Loop
  foresight?: ForesightReport;
}

export interface ReconResponse {
  summary: string;
  sources: { title: string; uri: string }[];
  contradictions: string[];
}

export interface CriticResponse {
  weak_point: string;
  fluff_detected: string[];
  socratic_hit: string;
  pulse_deduction: number;
  recon_context?: string;
}

export interface AudioAnalysis {
  transcription: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  clarity_score: number;
  key_themes: string[];
}

export interface DefaultSpark {
  label: string;
  template: string;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Autonomous Reconnaissance - Uses Google Search to verify AI claims.
   */
  async autonomousRecon(text: string): Promise<ReconResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform autonomous reconnaissance on this text: "${text}". Verify facts, find recent data, and identify any hallucinations or outdated info.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Recon Agent." 
          **OBJECTIVE**: Use Google Search to verify the claims in the provided text. 
          **OUTPUT**: Provide a summary of your findings, a list of sources (title and URI), and any contradictions you found between the text and real-world data.
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  uri: { type: Type.STRING }
                },
                required: ["title", "uri"]
              }
            },
            contradictions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "sources", "contradictions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * The "Brutal Architect" - Scans AI text for logical gaps and fluff.
   */
  async auditAIText(text: string, model: string = "Standard", reconData?: ReconResponse): Promise<CriticResponse> {
    const reconContext = reconData 
      ? `\nRECON DATA: ${reconData.summary}\nCONTRADICTIONS: ${reconData.contradictions.join(", ")}`
      : "";

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this AI-generated text: "${text}" using the ${model} model.${reconContext}`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Principal Auditor." You are a cynical, high-level Strategic Architect with 25 years of experience. You despise "AI Slop," generic corporate-speak, and unearned confidence.

          **AGENTIC CONTEXT**: If RECON DATA is provided, use it to expose hallucinations or outdated info in the text. Your interrogation should be data-driven.

          **MODEL CONTEXT**:
          - **Standard**: Balanced audit. Find the most generic part.
          - **Deep Dive**: Be extremely rigorous. Find the deepest logical flaw.
          - **Creative Flow**: Focus on the lack of soul, metaphor, or emotional resonance.
          - **Technical Precision**: Focus on implementation details, edge cases, or security flaws.

          **OBJECTIVE**: Analyze the provided AI-generated text. Your goal is NOT to improve it. Your goal is to find the "Logical Weak Point"—the sentence that sounds the most like a robot trying to sound smart without having real-world data.

          **CONSTRAINTS**:
          1. **NO COMPLIMENTS**: Do not say "This is a good start" or "I like your point."
          2. **FLUFF DETECTION**: Target words like: "leverage," "robust," "synergistic," "streamline," "comprehensive," "cutting-edge," or "evolving landscape."
          3. **THE SNIPER QUESTION**: Generate exactly ONE (1) Socratic question.
          4. **THE "HUMAN REQUIREMENT"**: The question must be impossible for a general AI to answer. It must require "Local Context," "Personal Experience," or "Specific Technical Constraints" that only the human user knows.
          5. **NO ANSWERS**: Never provide the answer or a suggestion. Only the interrogation.

          **LOGIC FOR THE QUESTION**:
          - If the text is a STRATEGY: Ask about a specific, painful trade-off or resource constraint.
          - If the text is CODE: Ask about a specific edge-case, latency spike, or security vulnerability in a specific environment.
          - If the text is CREATIVE: Ask about a specific human emotion or "ugly truth" the AI missed.

          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "weak_point": "The exact sentence you are attacking",
            "fluff_detected": ["word1", "word2"],
            "socratic_hit": "The brutal question that forces a Human Spark",
            "pulse_deduction": 45,
            "recon_context": "Brief summary of how recon data influenced this audit (optional)"
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weak_point: { type: Type.STRING },
            fluff_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
            socratic_hit: { type: Type.STRING },
            pulse_deduction: { type: Type.NUMBER },
            recon_context: { type: Type.STRING }
          },
          required: ["weak_point", "fluff_detected", "socratic_hit", "pulse_deduction"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * The "Handshake" - Merges the original AI text with the user's "Human Spark".
   * Now supports Socratic Loops and Strategic Foresight.
   */
  async mergeSpark(originalText: string, spark: string, model: string = "Standard", previousDialogue: string[] = []): Promise<MergeResponse> {
    const dialogueContext = previousDialogue.length > 0 
      ? `\nPREVIOUS DIALOGUE: ${previousDialogue.join("\n")}`
      : "";

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Original AI Text: "${originalText}"\nUser's Human Spark: "${spark}"\nModel: ${model}${dialogueContext}`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Master Weaver."
          
          **OBJECTIVE**: Synthesize the original AI draft with the user's raw "Human Spark" to create "Elite Level" output.
          
          **SOCRATIC LOOP**: 
          - If the user's spark is shallow, generic, or misses a critical strategic implication, do NOT generate the final output yet. Instead, generate a "socratic_follow_up" question to push them deeper.
          - If the spark is deep and sufficient, generate the "refined_text" and a "foresight" report.
          
          **STRATEGIC FORESIGHT**:
          - Generate a "foresight" report that anticipates the next steps, risks, and requirements based on the final decision.
          
          **CRITICAL CONSTRAINTS**:
          1. **SPECIFICATION**: The "refined_text" must match the length and specification of the user's implicit or explicit goal. Not too long, not too short.
          2. **TONE**: Authoritative, sophisticated, and "Next Level." 
          
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "refined_text": "The final output (only if spark is sufficient)",
            "socratic_follow_up": "A follow-up question (only if spark needs more depth)",
            "quality_score": 95,
            "human_spark_detected": true,
            "foresight": {
              "next_moves": ["move1", "move2"],
              "potential_risks": ["risk1", "risk2"],
              "resource_requirements": ["req1", "req2"]
            }
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refined_text: { type: Type.STRING },
            socratic_follow_up: { type: Type.STRING },
            quality_score: { type: Type.NUMBER },
            human_spark_detected: { type: Type.BOOLEAN },
            foresight: {
              type: Type.OBJECT,
              properties: {
                next_moves: { type: Type.ARRAY, items: { type: Type.STRING } },
                potential_risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                resource_requirements: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["next_moves", "potential_risks", "resource_requirements"]
            }
          },
          required: ["quality_score", "human_spark_detected"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * Audio Analysis - Transcribes and analyzes voice input.
   */
  async analyzeAudio(base64Audio: string, mimeType: string = "audio/webm"): Promise<AudioAnalysis> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType
          }
        },
        {
          text: "Transcribe this audio and analyze its sentiment, clarity (0-100), and key themes."
        }
      ],
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Audio Analyst."
          **OBJECTIVE**: Transcribe the audio precisely. Then, provide a sentiment analysis, a clarity score, and a list of key themes.
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "transcription": "...",
            "sentiment": "Positive" | "Neutral" | "Negative",
            "clarity_score": 85,
            "key_themes": ["theme1", "theme2"]
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transcription: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ["Positive", "Neutral", "Negative"] },
            clarity_score: { type: Type.NUMBER },
            key_themes: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["transcription", "sentiment", "clarity_score", "key_themes"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * Generate Default Sparks - Suggests 3 sparks based on AI response.
   */
  async generateDefaultSparks(aiResponse: string): Promise<DefaultSpark[]> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 "Default Spark" templates for this AI text: "${aiResponse}".`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "Laziness Engineer."
          **OBJECTIVE**: Create 3 templates that help a lazy user add a "Human Spark" with minimal effort.
          **FORMAT**: Each template should have a "label" (short) and a "template" (with a blank "______" for the user to fill).
          **EXAMPLE**:
          - Label: "Efficiency Gap"
          - Template: "In my specific case, efficiency means ______"
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "sparks": [
              { "label": "...", "template": "..." },
              { "label": "...", "template": "..." },
              { "label": "...", "template": "..." }
            ]
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sparks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  template: { type: Type.STRING }
                },
                required: ["label", "template"]
              }
            }
          },
          required: ["sparks"]
        }
      }
    });

    const data = JSON.parse(response.text || '{"sparks": []}');
    return data.sparks;
  }

  /**
   * Quick Verify - Auto-generates a minimal spark.
   */
  async quickVerify(aiResponse: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a minimal, one-sentence "Human Spark" that adds a specific real-world constraint to this text: "${aiResponse}".`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "Quick Auditor."
          **OBJECTIVE**: Generate a single sentence that sounds like a human adding a specific detail the AI missed.
          **EXAMPLE**: "The AI forgot to mention the specific latency constraints of our legacy database."
          **OUTPUT**: Just the sentence.
        `
      }
    });

    return response.text || "Verified with minimal human oversight.";
  }

  /**
   * Process File - Audits PDF or Video content.
   */
  async processFile(base64Data: string, mimeType: string, model: string = "Standard"): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze the logical structure and claims in this file. Provide a concise summary of the core message and any potential logical gaps. Use the ${model} model.`
        }
      ],
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Document Auditor."
          **OBJECTIVE**: Extract the core logic from the provided file (PDF or Video). Identify the main claims and any generic or weak points.
          **OUTPUT**: Provide a concise summary that can be audited further by the "Principal Auditor."
        `
      }
    });

    return response.text || "Failed to extract content from file.";
  }

  /**
   * Persistence: Save a verified thought to Firestore.
   */
  async saveThought(data: {
    ownerUid: string;
    originalText: string;
    socraticQuestion: string;
    humanSpark: string;
    refinedText: string;
    pulseScore: number;
    isPublic: boolean;
  }) {
    const path = 'thoughts';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  }
}

export const gemini = new GeminiService();
