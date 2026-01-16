// Previous imports remain the same...

export async function generateLearningFlow(userInput: string, apiKey: string, model: string) {
  const client = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    // Generate initial learning flow - GPT-5 Responses API
    const flowResponse = await (client as any).responses.create({
      model,
      input: [
        {
          role: "system",
          content: "You are an expert instructional designer specializing in creating detailed learning sequences with comprehensive resource specifications. Return complete JSON responses that include all required fields."
        },
        {
          role: "user",
          content: `${FLOW_GENERATION_PROMPT}\n\nUser requirements: ${userInput}\n\nPlease return a complete JSON response that matches the specified schema exactly.`
        }
      ],
      max_output_tokens: 12000,
      reasoning: { effort: "medium" }
    });

    if (!flowResponse.output_text) {
      throw new Error('No response content received from AI model');
    }

    let flowResult;
    try {
      flowResult = JSON.parse(flowResponse.output_text);
    } catch (error) {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Ensure environments array exists
    if (!flowResult.environments) {
      flowResult.environments = [];
    }

    // Enhance environments based on their type
    const enhancedEnvironments = await Promise.all(flowResult.environments.map(async (env: any) => {
      const promptType = env.type === 'physical' ? 'physical' : 
                        env.type === 'virtual' ? 'virtual' : 'hybrid';

      // GPT-5 Responses API
      const enhancementResponse = await (client as any).responses.create({
        model,
        input: [
          {
            role: "system",
            content: "You are an expert in designing learning environments with detailed resource specifications. Return complete JSON responses that include all required fields."
          },
          {
            role: "user",
            content: `${ENVIRONMENT_ENHANCEMENT_PROMPTS[promptType]}\n\nCurrent environment: ${JSON.stringify(env)}\n\nPlease return a complete JSON response that matches the specified schema exactly.`
          }
        ],
        max_output_tokens: 4000,
        reasoning: { effort: "low" }
      });

      if (!enhancementResponse.output_text) {
        throw new Error('No response content received from AI model for environment enhancement');
      }

      let enhancedEnv;
      try {
        enhancedEnv = JSON.parse(enhancementResponse.output_text);
      } catch (error) {
        throw new Error('Failed to parse AI response for environment enhancement as JSON');
      }

      // Ensure required arrays exist
      enhancedEnv.materials = enhancedEnv.materials || [];
      enhancedEnv.tools = enhancedEnv.tools || [];
      enhancedEnv.services = enhancedEnv.services || [];

      // Ensure each resource has required fields
      enhancedEnv.materials = enhancedEnv.materials.map((m: any) => ({
        id: m.id || `M${Math.random().toString(36).substr(2, 9)}`,
        name: m.name || 'Unnamed Material',
        material_type: m.material_type || m.type || 'generic',
        source: m.source || 'manual',
        access_link: m.access_link || ''
      }));

      enhancedEnv.tools = enhancedEnv.tools.map((t: any) => ({
        id: t.id || `T${Math.random().toString(36).substr(2, 9)}`,
        name: t.name || 'Unnamed Tool',
        tool_type: t.tool_type || t.type || 'generic',
        source: t.source || 'manual',
        access_link: t.access_link || ''
      }));

      enhancedEnv.services = enhancedEnv.services.map((s: any) => ({
        id: s.id || `S${Math.random().toString(36).substr(2, 9)}`,
        name: s.name || 'Unnamed Service',
        service_type: s.service_type || s.type || 'generic',
        source: s.source || 'manual',
        access_link: s.access_link || ''
      }));

      return {
        id: env.id || `E${Math.random().toString(36).substr(2, 9)}`,
        name: env.name || enhancedEnv.name || 'Unnamed Environment',
        description: env.description || enhancedEnv.description || 'No description provided',
        ...enhancedEnv
      };
    }));

    // Update the flow result with enhanced environments
    const finalResult = {
      ...flowResult,
      environments: enhancedEnvironments,
      // Ensure other required arrays exist
      actors: flowResult.actors || [],
      influence_factors: flowResult.influence_factors || [],
      implementation_notes: flowResult.implementation_notes || [],
      related_patterns: flowResult.related_patterns || [],
      sources: flowResult.sources || [],
      feedback: flowResult.feedback || { comments: [] }
    };

    // Validate the final template
    try {
      const validatedResult = TemplateSchema.parse(finalResult);
      return validatedResult;
    } catch (error) {
      console.error('Template validation failed:', error);
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => 
          `${issue.path.join('.')}: ${issue.message}`
        ).join('\n');
        throw new Error(`Template validation failed:\n${issues}`);
      }
      throw new Error('Failed to validate the generated template');
    }
  } catch (error) {
    console.error('Error generating learning flow:', error);
    throw error;
  }
}