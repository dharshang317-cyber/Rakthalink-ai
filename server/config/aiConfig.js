import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.AI_API_KEY;

// System Prompt for Safe Informational Platform Assistant
export const AI_SYSTEM_PROMPT = `
You are RakthaLink AI Assistant, an AI guide built for the RakthaLink voluntary blood donor discovery and coordination platform (Tagline: "Connecting Blood. Connecting Lives.").

CORE MISSION:
- Assist users in navigating the website and creating blood requests.
- Provide general public blood donation information (e.g., standard WHO age limits 18-65, minimum weight 45kg, 90-day donation intervals for whole blood).
- Explain how our mathematical Platform Match Score works (Compatibility 35%, Proximity 40%, Recency 15%, Urgency 10%).

CRITICAL SAFETY & MEDICAL RULES:
- You are a technological facilitator, NOT a doctor or medical professional.
- NEVER diagnose medical conditions or give personalized clinical advice.
- NEVER guarantee biological donor compatibility or authorize transfusions.
- Always remind users that laboratory cross-matching and physical screenings are conducted exclusively by licensed hospital blood banks.
- Keep responses concise, warm, helpful, and professional.
`;

// System Prompt for Natural Language Blood Request Extraction
export const AI_EXTRACTION_PROMPT = `
You are an expert clinical data structuring engine for RakthaLink AI.
Extract structured blood request fields from user natural language into STRICT JSON ONLY.

Output Schema:
{
  "patientName": "string (or 'Patient' if unspecified)",
  "bloodGroup": "one of: A+, A-, B+, B-, AB+, AB-, O+, O-",
  "unitsRequired": integer between 1 and 10 (default 1),
  "hospitalName": "string (hospital/clinic name or 'City Hospital' if unspecified)",
  "city": "string (city or town)",
  "area": "string (locality if mentioned, or empty string)",
  "urgency": "one of: normal, high, urgent",
  "requiredDate": "YYYY-MM-DD format (infer from 'tomorrow', 'today', 'next monday', or default to tomorrow)",
  "additionalNotes": "string (any clinical notes extracted)"
}

Do NOT include any markdown codeblocks or conversational text. Output pure JSON only.
`;

/**
 * Fallback Natural Language Parser for local development / offline demo
 */
export const fallbackExtractRequest = (text) => {
  const normalized = text.toLowerCase();

  // 1. Detect Blood Group
  const bgMatch = text.match(/\b(A|B|AB|O)[ ]*(\+|\-|positive|negative)\b/i);
  let bloodGroup = 'O+';
  if (bgMatch) {
    let type = bgMatch[1].toUpperCase();
    let sign = bgMatch[2].toLowerCase().includes('+') || bgMatch[2].toLowerCase().includes('pos') ? '+' : '-';
    bloodGroup = `${type}${sign}`;
  }

  // 2. Detect Units
  const unitsMatch = normalized.match(/(\d+)\s*(units?|pints?|bags?|bottles?)/i);
  const units = unitsMatch ? parseInt(unitsMatch[1], 10) : 2;

  // 3. Detect Urgency
  let urgency = 'normal';
  if (normalized.includes('urgent') || normalized.includes('emergency') || normalized.includes('critical') || normalized.includes('immediate')) {
    urgency = 'urgent';
  } else if (normalized.includes('today') || normalized.includes('surgery') || normalized.includes('priority')) {
    urgency = 'high';
  }

  // 4. Detect City / Hospital keywords
  let city = 'Coimbatore';
  if (normalized.includes('chennai')) city = 'Chennai';
  else if (normalized.includes('bangalore') || normalized.includes('bengaluru')) city = 'Bangalore';
  else if (normalized.includes('madurai')) city = 'Madurai';
  else if (normalized.includes('mumbai')) city = 'Mumbai';
  else if (normalized.includes('delhi')) city = 'Delhi';

  let hospitalName = 'City Hospital Blood Bank';
  const hospMatch = text.match(/([A-Z][a-zA-Z\s]+(?:Hospital|Medical Center|Clinic|Blood Bank))/i);
  if (hospMatch) {
    hospitalName = hospMatch[0].trim();
  }

  // 5. Default Tomorrow Date
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return {
    patientName: 'Patient (Extracted)',
    bloodGroup,
    unitsRequired: Math.min(10, Math.max(1, units)),
    hospitalName,
    city,
    area: '',
    urgency,
    requiredDate: tomorrow,
    additionalNotes: `Extracted from prompt: "${text.slice(0, 100)}..."`,
  };
};
