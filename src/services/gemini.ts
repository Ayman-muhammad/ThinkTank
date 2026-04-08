import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const apiKey = process.env.GEMINI_API_KEY;

export interface ForesightReport {
  next_moves: string[];
  potential_risks: string[];
  resource_requirements: string[];
}

export interface SocraticGenome {
  strengths: string[];
  weaknesses: string[];
  patterns: string[];
  logical_fallacies: string[];
  evidence_relied_on: string[];
  evidence_neglected: string[];
  lastAnalysis: string;
}

export interface MergeResponse {
  refined_text: string;
  quality_score: number;
  human_spark_detected: boolean;
  socratic_follow_up?: string; // For the Socratic Loop
  foresight?: ForesightReport;
  refined_image?: string; // Base64
  refined_video?: string; // URI
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
  summary: string;
  core_arguments: string[];
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

export interface GameChallenge {
  id: string;
  flawed_text: string;
  flaw_type: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  inlineData?: {
    data: string;
    mimeType: string;
  };
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
   * Socratic Genome Analysis - Analyzes user's thinking patterns over time.
   */
  async analyzeGenome(history: { originalText: string, refinedText: string, pulseScore: number }[]): Promise<SocraticGenome> {
    const historyContext = history.map((h, i) => `THOUGHT ${i+1}:\nOriginal: ${h.originalText}\nRefined: ${h.refinedText}\nScore: ${h.pulseScore}`).join("\n\n");

    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Analyze these 5+ verified thoughts to build a "Socratic Genome" for this user:\n\n${historyContext}`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Cognitive Psychologist."
          **OBJECTIVE**: Identify deep patterns in how this user thinks.
          **GRANULAR ANALYSIS**:
          1. **Strengths**: What are they good at? (e.g., technical precision, emotional depth).
          2. **Weaknesses**: Where do they struggle? (e.g., over-generalization, lack of detail).
          3. **Patterns**: Recurring logical structures or thematic focuses.
          4. **Logical Fallacies**: Identify common fallacies they employ (e.g., ad hominem, straw man, false dilemma, appeal to authority).
          5. **Evidence Relied On**: What types of evidence do they consistently use? (e.g., personal anecdotes, technical data, moral arguments).
          6. **Evidence Neglected**: What types of evidence do they consistently ignore? (e.g., statistical data, opposing viewpoints, long-term consequences).
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "strengths": ["...", "..."],
            "weaknesses": ["...", "..."],
            "patterns": ["...", "..."],
            "logical_fallacies": ["...", "..."],
            "evidence_relied_on": ["...", "..."],
            "evidence_neglected": ["...", "..."],
            "lastAnalysis": "ISO Date String"
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
            logical_fallacies: { type: Type.ARRAY, items: { type: Type.STRING } },
            evidence_relied_on: { type: Type.ARRAY, items: { type: Type.STRING } },
            evidence_neglected: { type: Type.ARRAY, items: { type: Type.STRING } },
            lastAnalysis: { type: Type.STRING }
          },
          required: ["strengths", "weaknesses", "patterns", "logical_fallacies", "evidence_relied_on", "evidence_neglected", "lastAnalysis"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * The "Brutal Architect" - Scans AI text for logical gaps and fluff.
   */
  async auditAIText(text: string, model: string = "Standard", reconData?: ReconResponse, genome?: SocraticGenome, useHighThinking: boolean = false): Promise<CriticResponse> {
    const reconContext = reconData 
      ? `\nRECON DATA: ${reconData.summary}\nCONTRADICTIONS: ${reconData.contradictions.join(", ")}`
      : "";

    const genomeContext = genome
      ? `\nUSER GENOME: Strengths: ${genome.strengths.join(", ")}, Weaknesses: ${genome.weaknesses.join(", ")}, Patterns: ${genome.patterns.join(", ")}, Fallacies: ${genome.logical_fallacies.join(", ")}, Relies on: ${genome.evidence_relied_on.join(", ")}, Neglects: ${genome.evidence_neglected.join(", ")}`
      : "";

    const response = await this.ai.models.generateContent({
      model: useHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
      contents: `Analyze this AI-generated text: "${text}" using the ${model} model.${reconContext}${genomeContext}`,
      config: {
        thinkingConfig: useHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Principal Auditor." You are a cynical, high-level Strategic Architect with 25 years of experience. You despise "AI Slop," generic corporate-speak, and unearned confidence.

          **AGENTIC CONTEXT**: If RECON DATA is provided, use it to expose hallucinations or outdated info in the text. Your interrogation should be data-driven.

          **SOCRATIC GENOME**: If USER GENOME is provided, adapt your Socratic question to challenge the user's specific weaknesses and patterns. If they are strong in logic but weak in empathy, push them on the human element. If they are prone to over-complication, force them to simplify.

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
            "summary": "A concise summary of the AI's response",
            "core_arguments": ["arg1", "arg2"],
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
            summary: { type: Type.STRING },
            core_arguments: { type: Type.ARRAY, items: { type: Type.STRING } },
            weak_point: { type: Type.STRING },
            fluff_detected: { type: Type.ARRAY, items: { type: Type.STRING } },
            socratic_hit: { type: Type.STRING },
            pulse_deduction: { type: Type.NUMBER },
            recon_context: { type: Type.STRING }
          },
          required: ["summary", "core_arguments", "weak_point", "fluff_detected", "socratic_hit", "pulse_deduction"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }

  /**
   * The "Handshake" - Merges the original AI text with the user's "Human Spark".
   * Now supports Socratic Loops and Strategic Foresight.
   */
  async mergeSpark(originalText: string, spark: string, model: string = "Standard", previousDialogue: string[] = [], genome?: SocraticGenome, inputMode: string = "text", base64Data?: string, mimeType?: string, isFinalize: boolean = false, useHighThinking: boolean = false): Promise<MergeResponse> {
    const dialogueContext = previousDialogue.length > 0 
      ? `\nPREVIOUS DIALOGUE: ${previousDialogue.join("\n")}`
      : "";

    const genomeContext = genome
      ? `\nUSER GENOME: Strengths: ${genome.strengths.join(", ")}, Weaknesses: ${genome.weaknesses.join(", ")}, Patterns: ${genome.patterns.join(", ")}`
      : "";

    const finalizeInstruction = isFinalize 
      ? "\n**FORCE FINALIZE**: The user has requested to finalize the synthesis. Do NOT generate a 'socratic_follow_up'. You MUST generate the 'refined_text' and 'foresight' report now."
      : "";

    const response = await this.ai.models.generateContent({
      model: useHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
      contents: `Original AI Text: "${originalText}"\nUser's Human Spark: "${spark}"\nModel: ${model}${dialogueContext}${genomeContext}${finalizeInstruction}`,
      config: {
        thinkingConfig: useHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Master Weaver."
          
          **OBJECTIVE**: Synthesize the original AI draft with the user's raw "Human Spark" to create "Elite Level" output.
          
          **SOCRATIC GENOME**: Use the USER GENOME to tailor the "socratic_follow_up" if needed. Challenge their known cognitive biases or patterns.
          
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

    const mergeResult: MergeResponse = JSON.parse(response.text || "{}");

    // Multimodal Synthesis
    if (mergeResult.refined_text && inputMode === "image" && base64Data && mimeType) {
      mergeResult.refined_image = await this.generateImage(mergeResult.refined_text, base64Data, mimeType);
    } else if (mergeResult.refined_text && inputMode === "video" && base64Data && mimeType) {
      mergeResult.refined_video = await this.generateVideo(mergeResult.refined_text, base64Data, mimeType);
    }

    return mergeResult;
  }

  /**
   * Generate High Quality Image based on refined text.
   */
  async generateImage(prompt: string, base64Source?: string, mimeType?: string): Promise<string> {
    const contents: any[] = [{ text: `Generate a high-quality, professional image based on this refined synthesis: "${prompt}". Focus on cinematic lighting and elite detail.` }];
    
    if (base64Source && mimeType) {
      contents.unshift({
        inlineData: {
          data: base64Source,
          mimeType: mimeType
        }
      });
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: { parts: contents },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return "";
  }

  /**
   * Generate High Quality Video based on refined text.
   */
  async generateVideo(prompt: string, base64Source?: string, mimeType?: string): Promise<string> {
    let operation = await this.ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-quality, cinematic video representing: ${prompt}`,
      image: base64Source ? {
        imageBytes: base64Source,
        mimeType: mimeType || 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await this.ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey!,
        },
      });
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return "";
  }

  /**
   * Text-to-Speech generation.
   */
  async generateTTS(text: string, voice: string = "Kore"): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak this with authority and clarity: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice as any },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const base64Audio = part?.inlineData?.data;
    let mimeType = part?.inlineData?.mimeType;
    
    if (base64Audio) {
      if (!mimeType) {
        if (base64Audio.startsWith('SUQz') || base64Audio.startsWith('//O')) {
          mimeType = 'audio/mpeg';
        } else if (base64Audio.startsWith('UklGR')) {
          mimeType = 'audio/wav';
        } else if (base64Audio.startsWith('GkXfo')) {
          mimeType = 'audio/webm';
        } else {
          mimeType = 'audio/mpeg';
        }
      }
      return `data:${mimeType};base64,${base64Audio}`;
    }
    return "";
  }

  /**
   * Music Generation using Lyria.
   */
  async generateMusic(prompt: string, isFullLength: boolean = false): Promise<string> {
    const response = await this.ai.models.generateContentStream({
      model: isFullLength ? "lyria-3-pro-preview" : "lyria-3-clip-preview",
      contents: prompt,
      config: {
        responseModalities: [Modality.AUDIO]
      }
    });

    let audioBase64 = "";
    let mimeType = "audio/wav";

    for await (const chunk of response) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
      }
    }

    if (audioBase64) {
      const binary = atob(audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      return URL.createObjectURL(blob);
    }
    return "";
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
   * Multi-turn Chat Interface.
   */
  async chat(messages: ChatMessage[], useHighThinking: boolean = false, useGrounding: boolean = false): Promise<string> {
    const model = useHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview";
    
    const response = await this.ai.models.generateContent({
      model,
      contents: messages.map(m => {
        const parts: any[] = [{ text: m.text }];
        if (m.inlineData) {
          parts.unshift({ inlineData: m.inlineData });
        }
        return {
          role: m.role,
          parts
        };
      }),
      config: {
        thinkingConfig: useHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        tools: useGrounding ? [{ googleSearch: {} }] : undefined,
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Cognitive Assistant."
          **OBJECTIVE**: Engage in a multi-turn dialogue to help the user refine their thoughts, explore complex ideas, and identify logical inconsistencies.
          **TONE**: Professional, insightful, and intellectually challenging.
          **MULTIMODAL**: You can analyze images, PDFs, and videos if provided.
        `
      }
    });

    return response.text || "No response generated.";
  }

  /**
   * Low Latency Response for fast tasks.
   */
  async fastResponse(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        systemInstruction: "Provide a lightning-fast, concise response."
      }
    });
    return response.text || "";
  }

  /**
   * Generate Default Sparks - Suggests 3 sparks based on AI response and audit results.
   */
  async generateDefaultSparks(aiResponse: string, weakPoint: string, socraticQuestion: string): Promise<DefaultSpark[]> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Original AI Text: "${aiResponse}"\nWeak Point Identified: "${weakPoint}"\nSocratic Question: "${socraticQuestion}"`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "Laziness Engineer."
          **OBJECTIVE**: Create 3 templates that help a lazy user add a "Human Spark" with minimal effort.
          **CONTEXT**: The user has been challenged by a Socratic Question about a specific Weak Point in the AI text.
          **FORMAT**: Each template should have a "label" (short) and a "template" (with a blank "______" for the user to fill).
          **STRATEGY**:
          1. One template should be a direct answer to the Socratic Question.
          2. One template should provide the "Local Context" or "Technical Constraint" requested.
          3. One template should be a "Brutal Truth" or "Real-World Reality Check."
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
   * Process File - Audits PDF, Image, or Video content.
   */
  async processFile(base64Data: string, mimeType: string, model: string = "Standard", useHighThinking: boolean = false): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: useHighThinking ? "gemini-3.1-pro-preview" : "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: `Analyze the logical structure and claims in this ${mimeType.split('/')[0]}. Provide a concise summary of the core message and any potential logical gaps. Use the ${model} model.`
        }
      ],
      config: {
        thinkingConfig: useHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Document Auditor."
          **OBJECTIVE**: Extract the core logic from the provided file (PDF, Image, or Video). Identify the main claims and any generic or weak points.
          **OUTPUT**: Provide a concise summary that can be audited further by the "Principal Auditor."
        `
      }
    });

    return response.text || "Failed to extract content from file.";
  }

  /**
   * The "Game Master" - Generates a flawed AI text for the user to audit.
   */
  async generateChallenge(): Promise<GameChallenge> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a "ThinkTank Audit Challenge". Create a short paragraph (2-3 sentences) that contains a subtle but clear logical fallacy.`,
      config: {
        systemInstruction: `
          **ROLE**: You are the "ThinkTank Game Master."
          **OBJECTIVE**: Create a challenging audit task for a user.
          **FALLACY TYPES**: Circular Reasoning, Straw Man, False Dilemma, Ad Hominem, Appeal to Authority, Hasty Generalization, Slippery Slope, Post Hoc Ergo Propter Hoc.
          **OUTPUT FORMAT (JSON ONLY)**:
          {
            "id": "unique_id",
            "flawed_text": "The text containing the fallacy.",
            "flaw_type": "The name of the fallacy.",
            "options": ["Fallacy A", "Fallacy B", "Fallacy C", "Fallacy D"],
            "correct_index": 0,
            "explanation": "A brief explanation of why this is the correct fallacy."
          }
        `,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            flawed_text: { type: Type.STRING },
            flaw_type: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct_index: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["id", "flawed_text", "flaw_type", "options", "correct_index", "explanation"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
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
