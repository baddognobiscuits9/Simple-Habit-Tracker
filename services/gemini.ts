import { GoogleGenAI } from "@google/genai";
import { Habit } from "../types";
import { getLocalDateKey } from "./date";

// Helper to calculate basic stats for the prompt
const analyzeHabits = (habits: Habit[]) => {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return getLocalDateKey(d);
  }).reverse();

  return habits.map(h => {
    const completions = last7Days.filter(date => h.logs[date]).length;
    // Extract recent notes if any
    const recentNotes = last7Days
      .filter(date => h.notes?.[date])
      .map(date => `[${date}]: ${h.notes![date]}`)
      .join('; ');

    return {
      name: h.name,
      category: h.category,
      last7DaysCompletions: completions,
      consistency: Math.round((completions / 7) * 100) + '%',
      notes: recentNotes // Pass notes to AI
    };
  });
};

export const getHabitCoaching = async (habits: Habit[], userQuery?: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const habitSummary = analyzeHabits(habits);

  const systemInstruction = `
    You are Habit Tracker AI, an intelligent, minimalist, and encouraging habit coach.
    Your tone is professional, concise, and calm (similar to the OpenAI brand voice).
    
    You are analyzing the user's habit data.
    - Provide specific, actionable advice based on their consistency.
    - If they are doing well, reinforce the behavior with subtle praise.
    - If they are struggling, suggest small, atomic adjustments.
    - Pay attention to any 'notes' the user has left. If they mention being sick or busy, offer empathy and recovery strategies.
    - Keep responses brief (under 150 words) unless asked for a deep dive.
    - Use bullet points for readability.
  `;

  const prompt = userQuery 
    ? `User Question: "${userQuery}"\n\nCurrent Habit Data: ${JSON.stringify(habitSummary)}`
    : `Please analyze my current habit progress and give me a weekly summary and 2 tips for improvement.\n\nCurrent Habit Data: ${JSON.stringify(habitSummary)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response at this moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the AI coach right now. Please try again later.";
  }
};