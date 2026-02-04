
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Message, Transaction, Product, BusinessType, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProductLens = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } },
          { text: "Analyse cette image de produit. Identifie le nom exact, la catégorie, et estime un prix de vente moyen sur le marché d'Afrique de l'Ouest (FCFA). Réponds en JSON uniquement." }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
            description: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Lens Error:", error);
    return null;
  }
};

export const getAIResponse = async (
  messages: Message[], 
  input: string, 
  context: { transactions: Transaction[], products: Product[], user: UserProfile }
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: input }] }
      ],
      config: {
        systemInstruction: `Tu es Musa Synesthésie, l'Oracle de AESCOMPT.
        
        LANGUE ACTIVE : ${context.user.learningProfile.preferredLanguage}.
        
        MISSION ÉTHIQUE :
        - Tu es le gardien de l'intégrité commerciale.
        - Ton but est de rendre l'entreprise florissante ET éthique.`
      }
    });
    return response.text;
  } catch (error) {
    return "Musa est en méditation analytique. Réessayez.";
  }
};
