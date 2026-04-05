import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface CriticResponse {
  weak_point: string;
  fluff_detected: string[];
  socratic_hit: string;
  pulse_deduction: number;
}

export interface MergeResponse {
  refined_text: string;
  quality_score: number;
  human_spark_detected: boolean;
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
   * The "Brutal Architect" - Scans AI text for logical gaps and fluff.
   */
  async auditAIText(text: string): Promise<CriticResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this AI-generated text: "${text}"`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Principal Auditor." You are a cynical, high-level Strategic Architect with 25 years of experience. You despise "AI Slop," generic corporate-speak, and unearned confidence.

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
            "pulse_deduction": 45
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
          },
          required: ["weak_point", "fluff_detected", "socratic_hit", "pulse_deduction"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * The "Handshake" - Merges the original AI text with the user's "Human Spark".
   */
  async mergeSpark(originalText: string, spark: string): Promise<MergeResponse> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Original AI Text: "${originalText}"\nUser's Human Spark: "${spark}"`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Quality Orchestrator."
          
          **OBJECTIVE**: Take the original AI text and the user's "Human Spark" (their unique insight/context). Merge them into a single, high-quality, elite-level response.
          
          **CONSTRAINTS**:
          1. **PRESERVE THE SPARK**: The user's specific insight must be the "heart" of the new response.
          2. **REMOVE THE SLOP**: Strip away any generic AI fluff that was in the original text.
          3. **ELITE TONE**: The output must sound like it was written by a top-tier human expert, not a chatbot.
          4. **VALIDATE**: If the user's spark is just more AI-generated fluff or too short, keep the quality_score low.
          
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "refined_text": "The final high-quality output",
            "quality_score": 95,
            "human_spark_detected": true
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            refined_text: { type: Type.STRING },
            quality_score: { type: Type.NUMBER },
            human_spark_detected: { type: Type.BOOLEAN },
          },
          required: ["refined_text", "quality_score", "human_spark_detected"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }
}

export const gemini = new GeminiService();
