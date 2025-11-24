import { GoogleGenAI, HarmCategory, HarmBlockThreshold, Content, Type } from "@google/genai";
import { AnalysisMode, ChatMessage, SlideData } from "../types";

// Initialize the client
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const getSystemInstruction = (mode: AnalysisMode): string => {
  const base = `You are TubeSight, an elite multimodal video analyst AI.
  
  CORE MISSION:
  Analyze the **Visual** and **Audio** content of the provided video file with extreme precision.

  LANGUAGE PROTOCOL (CRITICAL):
  1. **DETECT**: Automatically detect the language used by the user in their prompt or notes.
  2. **ADAPT**: If the user writes in English, reply in English. If the user writes in French, reply in French.
  3. **DEFAULT**: If no text is provided, default to the language spoken in the video.

  INTELLIGENCE PROTOCOL:
  1. **Multimodal Synthesis**: Combine visual cues (screen text, body language, scene changes) with audio (dialogue, tone) for a holistic understanding.
  2. **Deep Reasoning**: Do not just describe. Explain *why* things are happening. Connect concepts.
  3. **Specificity**: Quote specific lines. Describe specific visual elements (colors, UI elements).
  
  FORMATTING:
  *   Use professional Markdown.
  *   Use **bold** for key terms.
  *   Use bullet points for readability.`;
  
  switch (mode) {
    case 'summary':
      return `${base} 
      
      TASK: COMPREHENSIVE SUMMARY
      - **Visual Overview**: What is happening visually?
      - **Narrative Arc**: Chronological breakdown.
      - **Core Message**: The thesis/main point.
      - **Deep Insight**: Subtext or implicit meaning.`;
    case 'key_takeaways':
      return `${base}
      
      TASK: KEY TAKEAWAYS & ACTIONABLE ITEMS
      - Extract 5-10 distinct lessons.
      - If tutorial: List steps.
      - If review: List pros/cons.
      - Prioritize unique insights over generic ones.`;
    case 'sentiment':
      return `${base}
      
      TASK: SENTIMENT & ATMOSPHERE
      - Analyze Speaker Tone (Excited, Professional, Skeptical).
      - Analyze Visual Style (High production, Raw).
      - Audio/Visual Cohesion check.`;
    case 'technical':
      return `${base}
      
      TASK: TECHNICAL DATA EXTRACTION
      - Transcribe on-screen text (slides, code).
      - List specific tools, products, or numbers.
      - Note timestamps of key demos.`;
    case 'qa':
      return `${base}
      
      TASK: Q&A GENERATION
      - Generate 5 complex questions a viewer might have.
      - Answer them using ONLY evidence from the video.`;
    default:
      return base;
  }
};

export const analyzeUploadedVideo = async (
  videoBase64: string,
  mimeType: string,
  userNotes: string,
  mode: AnalysisMode
): Promise<{ text: string }> => {
  
  if (!apiKey) {
    throw new Error("API Key missing.");
  }

  const modelId = "gemini-2.5-flash";

  const promptText = `Analyze this video file deeply.
  User Notes/Context: ${userNotes || "No specific notes provided."}
  
  Perform a '${mode}' analysis. 
  REMEMBER: Reply in the SAME LANGUAGE as the User Notes. If User Notes are empty, reply in the language spoken in the video.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: videoBase64
                }
            },
            {
                text: promptText
            }
        ]
      },
      config: {
        systemInstruction: getSystemInstruction(mode),
        thinkingConfig: {
            thinkingBudget: 10240, 
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          }
        ],
      },
    });

    const text = response.text || "Analysis complete, but no text returned.";
    
    return { text };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("413")) {
         throw new Error("Video file too large. Please try a shorter clip.");
    }
    throw new Error(error.message || "Video analysis failed.");
  }
};

export const streamChatMessage = async function* (
  videoBase64: string,
  mimeType: string,
  history: ChatMessage[],
  newMessage: string
) {
  
  if (!apiKey) {
    throw new Error("API Key missing.");
  }

  const modelId = "gemini-2.5-flash";

  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        { inlineData: { mimeType, data: videoBase64 } }, 
        { text: "Here is the video file context." }
      ]
    },
    {
      role: 'model',
      parts: [{ text: "I have analyzed the video. I am ready to answer questions." }]
    }
  ];

  history.forEach(msg => {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }]
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: `You are TubeSight. 
        LANGUAGE RULE: If the user speaks English, reply in English. If the user speaks French, reply in French.
        INTELLIGENCE: Think step-by-step. Don't hallucinate. Use specific video evidence.`,
        thinkingConfig: {
            thinkingBudget: 8192, 
        },
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH }
        ],
      },
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }

  } catch (error: any) {
    console.error("Gemini Chat Stream Error:", error);
    throw new Error(error.message || "Message stream failed.");
  }
};

export const generatePresentation = async (
  videoBase64: string,
  mimeType: string,
  userInstructions: string,
  audience: string,
  style: string,
  colorTheme: string,
  slideCount: number,
  language: 'fr' | 'en'
): Promise<SlideData[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const textModelId = "gemini-2.5-flash";
  const targetLangName = language === 'fr' ? 'FRENCH' : 'ENGLISH';
  
  const prompt = `You are a professional presentation designer.
  Analyze this video and create a cohesive ${slideCount}-slide deck.
  
  CONTEXT:
  - Instructions: ${userInstructions || "Summarize key points."}
  - Audience: ${audience || "General"}
  - Visual Style: ${style || "Modern"}
  - Theme: ${colorTheme || "Corporate"}

  REQUIREMENTS:
  1. **Narrative Flow**: Tell a story (Intro -> Body -> Conclusion).
  2. **LANGUAGE**: ALL OUTPUT TEXT MUST BE IN ${targetLangName}.
  3. **Speaker Notes**: Write brief oral presentation notes for each slide in ${targetLangName}.
  4. **Visuals**: Create a distinct image prompt (in English for the generator) for each slide.
  5. **Titles**: Concise, compelling, under 8 words.
  
  OUTPUT FORMAT: JSON Array.
  `;

  let slidePlans: any[] = [];
  try {
    const response = await ai.models.generateContent({
      model: textModelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: videoBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              notes: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["title", "bulletPoints", "notes", "imagePrompt"]
          }
        },
        thinkingConfig: { thinkingBudget: 12288 } 
      }
    });
    
    const jsonText = response.text;
    if (!jsonText) throw new Error("No JSON response");
    slidePlans = JSON.parse(jsonText);
  } catch (e: any) {
    console.error("Step 1 (Plan) Error:", e);
    throw new Error("Failed to plan presentation.");
  }

  const imageModelId = "gemini-2.5-flash-image";

  const imagePromises = slidePlans.map(async (plan, index) => {
    try {
      const imageResponse = await ai.models.generateContent({
        model: imageModelId,
        contents: {
          parts: [{ text: `${plan.imagePrompt}. Style: ${style}. Colors: ${colorTheme}. High quality, 4k, text-free, abstract presentation background.` }]
        },
      });

      let base64Image = "";
      if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }
      
      return {
        id: `slide-${index}`,
        title: plan.title,
        bulletPoints: plan.bulletPoints,
        notes: plan.notes,
        imageBase64: base64Image
      };
    } catch (err) {
      console.error(`Failed to generate image for slide ${index}`, err);
      return {
        id: `slide-${index}`,
        title: plan.title,
        bulletPoints: plan.bulletPoints,
        notes: plan.notes,
        imageBase64: "" 
      };
    }
  });

  const results = await Promise.all(imagePromises);
  return results;
};