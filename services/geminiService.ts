
import { GoogleGenAI } from "@google/genai";
import { PlayerEfpOutput } from "../types";

// IMPORTANT: This assumes the API key is set in the environment.
// Do not add any UI for key management.
let ai: GoogleGenAI | null = null;
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. API_KEY may be missing.", error);
}

export const getPlayerAnalysis = async (player: PlayerEfpOutput): Promise<string> => {
  if (!ai) {
    return "Gemini API client is not initialized. Please ensure your API key is configured correctly.";
  }

  const {
    player: playerName,
    position,
    team,
    opponent,
    EFP,
    E_goals,
    E_assists,
    P_clean_sheet,
    E_saves,
    E_bonus,
    prob_starts,
  } = player;

  const prompt = `
    You are an expert fantasy football analyst for the Women's Super League (WSL).
    Provide a concise analysis for a player for their upcoming match.
    Use markdown for formatting, including bolding for key stats and bullet points for strengths/risks.

    **Player:** ${playerName} (${position}, ${team})
    **Opponent:** ${opponent}
    **Projected Fantasy Points (EFP):** ${EFP.toFixed(2)}

    **Key Projected Stats:**
    - **Expected Goals (xG):** ${E_goals.toFixed(2)}
    - **Expected Assists (xA):** ${E_assists.toFixed(2)}
    - **Clean Sheet Probability:** ${(P_clean_sheet * 100).toFixed(1)}%
    - **Probability of Starting:** ${(prob_starts * 100).toFixed(0)}%
    ${position === 'GK' ? `- **Expected Saves:** ${E_saves.toFixed(2)}` : ''}
    - **Expected Bonus:** ${E_bonus.toFixed(2)}

    Based on this data, provide a brief "Fantasy Outlook" covering:
    1.  A summary of their potential for the gameweek.
    2.  Their main strengths or routes to points (e.g., goal threat, creative force, clean sheet potential).
    3.  Any potential risks (e.g., tough opponent, rotation risk).
    
    Keep the analysis to 2-3 short paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get player analysis from Gemini API.");
  }
};
