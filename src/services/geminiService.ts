import { GoogleGenAI, Type } from "@google/genai";
import { Job, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function matchJobsWithProfile(jobs: Job[], profile: UserProfile): Promise<{ jobId: string; score: number; reasoning: string }[]> {
  if (!jobs.length || !profile.skills?.length) return [];

  const prompt = `
    You are an expert career coach. Match the following job listings with the user's profile.
    
    User Profile:
    - Skills: ${profile.skills?.join(', ') || 'N/A'}
    - Bio: ${profile.bio || 'N/A'}
    - Resume: ${profile.resumeName ? `User has uploaded a resume named "${profile.resumeName}".` : 'No resume uploaded.'}
    - Preferences: ${JSON.stringify(profile.preferences || {})}
    
    Jobs:
    ${jobs.slice(0, 10).map((j, i) => `
    Job ${i}:
    - Title: ${j.title}
    - Company: ${j.company}
    - Tags: ${j.tags?.join(', ') || 'N/A'}
    - Description Summary: ${j.description?.substring(0, 200)}...
    `).join('\n')}
    
    Return a JSON array of objects with 'jobId' (from the list above), 'score' (0-100), and 'reasoning' (short explanation).
    Only include jobs with a score > 60.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              jobId: { type: Type.STRING },
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["jobId", "score", "reasoning"]
          }
        }
      }
    });

    const results = JSON.parse(response.text);
    // Map back the jobId to the actual job ID
    return results.map((res: any) => {
      const jobIndex = parseInt(res.jobId.replace('Job ', ''));
      return {
        jobId: jobs[jobIndex]?.id,
        score: res.score,
        reasoning: res.reasoning
      };
    }).filter((r: any) => r.jobId);
  } catch (error) {
    console.error('Error in AI matchmaking:', error);
    return [];
  }
}
