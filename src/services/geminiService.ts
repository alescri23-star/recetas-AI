import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Recipe } from '../types';

// FIX: Use process.env.API_KEY as per the guidelines, as import.meta.env is not standard for all environments.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.OBJECT,
  properties: {
    titulo: { type: Type.STRING, description: "El nombre creativo y apetitoso de la receta." },
    descripcion: { type: Type.STRING, description: "Una breve descripción de 1-2 frases sobre el plato." },
    tiempo_preparacion: { type: Type.STRING, description: "Tiempo estimado para preparar los ingredientes (ej. '15 minutos')." },
    tiempo_coccion: { type: Type.STRING, description: "Tiempo estimado de cocción (ej. '30 minutos')." },
    ingredientes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista completa de ingredientes con cantidades (ej. '2 pechugas de pollo')."
    },
    instrucciones: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Pasos numerados y claros para preparar la receta."
    },
    utensilios: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de utensilios de cocina necesarios (ej. 'sartén', 'olla', 'cuchillo')."
    },
    coste: {
      type: Type.STRING,
      enum: ['Económico', 'Medio', 'Alto'],
      description: "Clasificación del coste de la receta."
    },
    tipo_dieta: {
        type: Type.STRING,
        enum: ['Normal', 'Dietética'],
        description: "Clasificar como 'Dietética' si es notablemente baja en calorías/grasas, de lo contrario 'Normal'."
    },
    origen: {
        type: Type.STRING,
        enum: ['Nacional', 'Internacional'],
        description: "Clasificar como 'Nacional' si es un plato típico español, de lo contrario 'Internacional'."
    },
    video_url: {
        type: Type.STRING,
        description: "Este campo será poblado por una búsqueda separada. No intentes rellenarlo. Devuelve una cadena vacía."
    }
  },
  required: ["titulo", "descripcion", "tiempo_preparacion", "tiempo_coccion", "ingredientes", "instrucciones", "utensilios", "coste", "tipo_dieta", "origen"]
};

const recipeArraySchema = {
    type: Type.ARRAY,
    items: recipeSchema
};


export const identifyIngredientsFromImage = async (base64ImageData: string): Promise<string[]> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };
  const textPart = {
    text: "Identifica los principales ingredientes de comida en esta imagen. Enuméralos separados por comas. Si no se puede identificar ningún alimento, devuelve una cadena vacía.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
    });

    const text = response.text.trim();
    if (!text) return [];

    return text.split(',').map(ingredient => ingredient.trim()).filter(Boolean);
  } catch (error) {
    console.error("Error identifying ingredients:", error);
    throw new Error("Failed to identify ingredients from image.");
  }
};

export const generateRecipe = async (ingredients: string[], filters: string[]): Promise<Omit<Recipe, 'id'>> => {
  const filterText = filters.length > 0 ? ` La receta debe cumplir con los siguientes criterios: ${filters.join(', ')}.` : '';

  const prompt = `Eres un chef experto. Crea una receta detallada y deliciosa usando los siguientes ingredientes: ${ingredients.join(', ')}.${filterText} Clasifica la receta según su coste, tipo de dieta y origen. Responde únicamente con el JSON estructurado. No busques un vídeo, ese paso se hará por separado.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeSchema
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Omit<Recipe, 'id'>;
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe.");
  }
};

export const searchGlobalRecipes = async (query: string): Promise<Omit<Recipe, 'id'>[]> => {
  const prompt = `Eres una enciclopedia culinaria mundial. Busca recetas que coincidan con "${query}". Devuelve una lista de hasta 3 recetas populares y bien valoradas que se ajusten a la búsqueda. Para cada receta, proporciona todos los detalles: título, descripción, tiempos, ingredientes, instrucciones, utensilios, coste, tipo de dieta y origen. No incluyas URL de vídeos. Responde únicamente con un array JSON que siga el schema definido. Si no encuentras ninguna receta, devuelve un array vacío.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: recipeArraySchema
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        return [];
    }
    return JSON.parse(jsonText) as Omit<Recipe, 'id'>[];
  } catch (error) {
    console.error("Error searching global recipes:", error);
    throw new Error("Failed to search for recipes.");
  }
};

export const findRecipeVideo = async (recipeTitle: string): Promise<string> => {
    const prompt = `Busca en YouTube un vídeo de receta para "${recipeTitle}". Devuelve únicamente la URL completa y directa del vídeo más relevante. Si no encuentras un vídeo adecuado, devuelve una cadena vacía.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });
        return response.text?.trim() ?? "";
    } catch (error) {
        console.error("Error finding recipe video:", error);
        return ""; // Return empty string on error to not break the flow
    }
};

export const startChat = (recipe: Recipe): Chat => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Eres un asistente de chef experto y amigable. Tu propósito es responder preguntas sobre la siguiente receta:
      
      Título: ${recipe.titulo}
      Descripción: ${recipe.descripcion}
      Ingredientes: ${recipe.ingredientes.join(', ')}
      Instrucciones: ${recipe.instrucciones.join('; ')}

      Responde únicamente a preguntas relacionadas con esta receta, como sustituciones de ingredientes, consejos de cocina, maridajes, información nutricional, etc. Si te preguntan algo no relacionado con la receta, amablemente redirige la conversación de vuelta a la receta. Sé conciso y útil.`,
    }
  });
  return chat;
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("No se pudo obtener una respuesta del chef.");
    }
};
