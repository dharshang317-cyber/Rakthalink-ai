import { AI_SYSTEM_PROMPT, AI_EXTRACTION_PROMPT, fallbackExtractRequest } from '../config/aiConfig.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Server-Side AI Service Gateway
 * Handles structured request extraction and safe platform Q&A.
 */

/**
 * Parses unstructured natural language text into a validated blood request JSON object.
 */
export const extractStructuredRequest = async (promptText) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && !apiKey.startsWith('mock_') && apiKey.length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.AI_MODEL || 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const fullPrompt = `${AI_EXTRACTION_PROMPT}\n\nUser Input: "${promptText}"`;
      const result = await model.generateContent(fullPrompt);
      const responseText = result.response.text();

      const parsed = JSON.parse(responseText);

      // Validate parsed fields
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodGroups.includes(parsed.bloodGroup)) {
        parsed.bloodGroup = 'O+';
      }
      parsed.unitsRequired = Number(parsed.unitsRequired) || 1;
      parsed.unitsRequired = Math.min(10, Math.max(1, parsed.unitsRequired));

      return {
        success: true,
        source: 'llm_api',
        data: parsed,
      };
    } catch (error) {
      console.warn('[AI API WARNING] Live LLM call failed. Falling back to internal heuristic parser:', error.message);
    }
  }

  // Fallback to internal heuristic extractor
  const fallbackData = fallbackExtractRequest(promptText);
  return {
    success: true,
    source: 'heuristic_parser',
    data: fallbackData,
  };
};

/**
 * Generates an informational conversational response with safety guardrails.
 */
export const generateConversationalReply = async (userMessage, history = []) => {
  const apiKey = process.env.AI_API_KEY;

  if (apiKey && !apiKey.startsWith('mock_') && apiKey.length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.AI_MODEL || 'gemini-1.5-flash',
        systemInstruction: AI_SYSTEM_PROMPT,
      });

      // Format chat history
      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
      });

      const result = await chat.sendMessage(userMessage);
      return {
        success: true,
        source: 'llm_api',
        reply: result.response.text(),
      };
    } catch (error) {
      console.warn('[AI CHAT WARNING] Live LLM call failed. Falling back to static knowledge base:', error.message);
    }
  }

  // High-Quality Rule-Based Knowledge Engine for Offline/Development Demonstrations
  const lower = userMessage.toLowerCase();
  let reply = '';

  if (lower.includes('match') || lower.includes('score') || lower.includes('algorithm') || lower.includes('how it works')) {
    reply = `The RakthaLink Smart Matching Engine ranks voluntary donors based on 4 logistical factors:
1. **Biological Compatibility (35%)**: Filters donors based on red blood cell suitability.
2. **Geodesic Distance Proximity (40%)**: Uses the Haversine formula to find donors nearest to the hospital.
3. **Donation Recency (15%)**: Prioritizes donors with >90 days since their last donation for safe health recovery.
4. **Urgency Weight (10%)**: Adjusts alerts based on normal, high, or emergency timelines.

*Note: The score is an operational coordination index. Final cross-matching must be verified at the hospital blood bank.*`;
  } else if (lower.includes('eligib') || lower.includes('who can donate') || lower.includes('weight') || lower.includes('age')) {
    reply = `According to general WHO voluntary blood donation guidelines:
- **Age:** Between 18 and 65 years old.
- **Weight:** At least 45 kg.
- **Interval:** Minimum 90 days between whole blood donations.
- **General Health:** Feeling well, rested, hydrated, with normal hemoglobin levels (≥12.5 g/dL).

You should NOT donate if currently having a fever, pregnant, or recently had a tattoo/piercing within the last 6 months.`;
  } else if (lower.includes('universal') || lower.includes('o negative') || lower.includes('ab positive') || lower.includes('compatible')) {
    reply = `Blood Compatibility Highlights:
- **O Negative (O-):** Universal Red Cell Donor. Can donate to all blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **AB Positive (AB+):** Universal Recipient. Can safely receive red blood cells from any blood type.
- **O Positive (O+):** Can donate to all positive blood groups (A+, B+, AB+, O+).`;
  } else if (lower.includes('need') || lower.includes('request') || lower.includes('unit') || lower.includes('urgent')) {
    reply = `I can help you structure this blood request! Please click on **"Post Blood Need"** or use our **AI Request Extractor** on the request creation page to automatically convert your message into verified hospital fields for your confirmation.`;
  } else {
    reply = `Hello! I am the RakthaLink AI Assistant. I can help you understand blood compatibility, explain donor eligibility guidelines, navigate the platform, or structure urgent requests. How can I assist your voluntary coordination today?`;
  }

  return {
    success: true,
    source: 'knowledge_engine',
    reply,
  };
};
