import { OpenAI } from 'openai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Schema definitions using Zod
const BaseItemSchema = z.object({
  description: z.string().min(1)
});

const SolutionSchema = z.object({
  solution_description: z.string().min(1),
  didactic_approach: z.string().min(1),
  didactic_template: z.record(z.any()),
  consequences: z.record(z.any()),
  implementation_notes: z.array(z.any()),
  related_patterns: z.array(z.any()),
  sources: z.array(z.any())
});

const TemplateSchema = z.object({
  metadata: z.record(z.any()),
  problem: z.record(z.any()),
  context: z.record(z.any()),
  influence_factors: z.array(z.any()),
  solution: SolutionSchema,
  consequences: z.record(z.any()),
  implementation_notes: z.array(z.any()),
  related_patterns: z.array(z.any()),
  feedback: z.record(z.any()),
  sources: z.array(z.any())
});

// Example template and hints moved to separate files for better organization
import { EXAMPLE_TEMPLATE } from './templates/example.js';
import { SEQUENCING_HINTS } from './templates/hints.js';

function extractJson(text) {
  const jsonPattern = /```json([\s\S]*?)```/;
  const match = text.match(jsonPattern);
  return match ? match[1].trim() : null;
}

async function createCompletion(client, model, prompt, retries = 5) {
  let lastError = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Du bist ein hilfreicher Assistent." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 5000,
        response_format: { type: "json_object" }
      });
    } catch (error) {
      lastError = error;
      if (i === retries - 1) break;
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, i), 10000)));
    }
  }
  throw lastError;
}

async function completeTemplate(template, userInput, options = {}) {
  const { model = "gpt-4", apiKey = null, llmModel = null } = options;
  const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
  const modelToUse = llmModel || model;
  
  if (!finalApiKey) {
    return [null, "OpenAI API key is missing. Bitte setzen Sie die Umgebungsvariable OPENAI_API_KEY."];
  }

  try {
    const client = new OpenAI({ apiKey: finalApiKey });
    const currentTemplate = JSON.stringify(template, null, 2);
    
    const prompt = `
Sie sind ein KI-Assistent, der Lehrkräften hilft, ein didaktisches Template zu vervollständigen.

Aktueller Stand des Templates:
${currentTemplate}

Wünsche oder Anweisungen des Nutzers:
${userInput}

Zusätzliche Hinweise zur Erstellung des Templates:
${SEQUENCING_HINTS}

Bitte vervollständigen Sie das Template basierend auf den Wünschen und verwenden Sie das folgende Beispiel als Referenz:
${JSON.stringify(EXAMPLE_TEMPLATE, null, 2)}

Geben Sie das vervollständigte Template im JSON-Format zurück.
`;

    const response = await createCompletion(client, modelToUse, prompt);
    
    if (response.choices[0].message.content) {
      try {
        const newTemplate = JSON.parse(response.choices[0].message.content);
        TemplateSchema.parse(newTemplate);
        return [newTemplate, "Das Template wurde erfolgreich vervollständigt und aktualisiert."];
      } catch (error) {
        const jsonStr = extractJson(response.choices[0].message.content);
        if (jsonStr) {
          try {
            const newTemplate = JSON.parse(jsonStr);
            TemplateSchema.parse(newTemplate);
            return [newTemplate, "Das Template wurde erfolgreich vervollständigt und aktualisiert."];
          } catch (error) {
            return [null, `Fehler beim Parsen des JSON: ${error.message}`];
          }
        }
        return [null, "Kein gültiges JSON in der Antwort gefunden."];
      }
    }
    return [null, "Unerwartetes Antwortformat vom KI-Modell."];
  } catch (error) {
    if (error.name === "BadRequestError") {
      return [null, `Bad Request: ${error.message}`];
    }
    if (error.name === "OpenAIError") {
      return [null, `OpenAI-Fehler: ${error.message}`];
    }
    return [null, `Allgemeiner Fehler: ${error.message}`];
  }
}

// Example usage
const template = EXAMPLE_TEMPLATE;
const userInput = "Bitte füge mehr Details zur Differenzierung hinzu.";
const options = {
  model: "gpt-4",
  llmModel: process.env.LLM_MODEL // Optional override
};

completeTemplate(template, userInput, options)
  .then(([result, message]) => {
    if (result) {
      console.log("Success:", message);
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.error("Error:", message);
    }
  })
  .catch(error => {
    console.error("Error:", error.message);
  });