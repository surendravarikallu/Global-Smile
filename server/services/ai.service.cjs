// ─── AI Service Layer ──────────────────────────
// Handles multi-provider dental analysis with fallback chain,
// health tracking, and response normalization.

const DENTAL_PROMPT = `You are an expert dental analysis AI. You may receive one or more dental images including:
- Smile photo (front-facing smile showing teeth)
- Inside mouth view (open mouth showing teeth and gums)
- Upper jaw / upper arch view
- Lower jaw / lower arch view
- X-rays, reports, or other dental documents

Analyze ALL provided images comprehensively and provide a structured, detailed assessment.

IMPORTANT RULES:
- Be specific about tooth locations using Universal Numbering System
- Provide confidence scores based on image quality and visibility
- Always include disclaimers about professional consultation
- Focus on visible clinical signs only
- If multiple views are provided, cross-reference findings across views for higher accuracy
- If X-rays or documents are included, incorporate radiographic findings

Return ONLY valid JSON with this exact structure (no markdown, no text before/after):
{
  "overallScore": <number 0-100>,
  "findings": [
    {
      "id": "<unique-id>",
      "issue": "<clinical issue name>",
      "severity": "mild" | "moderate" | "severe",
      "location": "<specific tooth region>",
      "toothNumbers": [<Universal Numbering>],
      "description": "<detailed clinical observation>",
      "confidence": <number 0-100>,
      "source": "<which image type this was observed in>"
    }
  ],
  "recommendations": [
    {
      "treatment": "<treatment name>",
      "priority": "high" | "medium" | "low",
      "description": "<clinical rationale>",
      "estimatedCostRange": "<USD range>"
    }
  ],
  "aestheticAssessment": {
    "symmetry": <0-100>,
    "colorConsistency": <0-100>,
    "gumHealth": <0-100>,
    "alignment": <0-100>,
    "overallAesthetics": <0-100>
  },
  "summary": "<2-3 sentence clinical summary>"
}`;

// ─── Provider Health Tracking ──────────────────
const providerHealth = new Map();
const HEALTH_RECOVERY_MS = 5 * 60 * 1000; // 5 min recovery

function isProviderHealthy(provider) {
  const entry = providerHealth.get(provider);
  if (!entry) return true;
  if (Date.now() - entry.failedAt > HEALTH_RECOVERY_MS) {
    providerHealth.delete(provider);
    return true;
  }
  return false;
}

function markProviderUnhealthy(provider, error) {
  providerHealth.set(provider, { failedAt: Date.now(), error: error.message });
  console.error(`  ⚠ AI Provider [${provider}] marked unhealthy: ${error.message}`);
}

// ─── Build multi-image message content ─────────
function buildMessageContent(imageBase64, extraImages) {
  const content = [{ type: 'text', text: DENTAL_PROMPT }];
  // Primary image
  content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } });
  // Extra images from multi-upload
  if (Array.isArray(extraImages)) {
    for (const img of extraImages.slice(0, 5)) {
      if (img.base64 && img.base64 !== imageBase64) {
        content.push({ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${img.base64}` } });
      }
    }
  }
  return content;
}

// ─── OpenRouter Analysis ───────────────────────
async function analyzeWithOpenRouter(imageBase64, signal, extraImages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://globalsmile.health',
      'X-Title': 'Global Smile AI Dental Analysis',
    },
    signal,
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: buildMessageContent(imageBase64, extraImages),
      }],
      max_tokens: 2048,
      temperature: 0.2,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`OpenRouter ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const usage = data.usage;

  return {
    raw: content,
    model: data.model || model,
    usage,
    estimatedCost: usage ? (usage.prompt_tokens * 0.0000001 + usage.completion_tokens * 0.0000004) : null,
  };
}

// ─── NVIDIA NIM Analysis ───────────────────────
async function analyzeWithNvidia(imageBase64, signal, extraImages) {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL || 'google/gemma-3n-e4b-it';

  if (!apiKey) throw new Error('NVIDIA_API_KEY not configured');

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      model,
      messages: [{
        role: 'user',
        content: buildMessageContent(imageBase64, extraImages),
      }],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`NVIDIA ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  return {
    raw: data.choices?.[0]?.message?.content,
    model: data.model || model,
    usage: data.usage,
    estimatedCost: null,
  };
}

// ─── HuggingFace Analysis ──────────────────────
async function analyzeWithHuggingFace(imageBase64, signal) {
  const apiKey = process.env.HF_API_KEY;
  const model = process.env.HF_MODEL || 'Salesforce/blip2-opt-2.7b';

  if (!apiKey) throw new Error('HF_API_KEY not configured');

  const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal,
    body: JSON.stringify({
      inputs: { image: imageBase64, text: DENTAL_PROMPT },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(`HuggingFace ${response.status}: ${errBody.substring(0, 200)}`);
  }

  const data = await response.json();
  return {
    raw: typeof data === 'string' ? data : JSON.stringify(data),
    model,
    usage: null,
    estimatedCost: null,
  };
}

// ─── Response Parser ───────────────────────────
function parseAnalysisResponse(rawResponse) {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return null;
  }

  try {
    // Extract JSON from response (may have markdown code blocks)
    let jsonStr = rawResponse;

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // Find the outermost JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (typeof parsed.overallScore === 'number' && Array.isArray(parsed.findings)) {
        // Normalize scores to 0-100 range
        parsed.overallScore = Math.max(0, Math.min(100, parsed.overallScore));
        if (parsed.aestheticAssessment) {
          for (const key of Object.keys(parsed.aestheticAssessment)) {
            parsed.aestheticAssessment[key] = Math.max(0, Math.min(100, parsed.aestheticAssessment[key]));
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('  ⚠ Failed to parse AI response:', e.message);
  }

  return null;
}

// ─── Demo Analysis ─────────────────────────────
function generateDemoAnalysis() {
  return {
    overallScore: 74,
    findings: [
      { id: 'f1', issue: 'Minor Discoloration', severity: 'mild', location: 'Upper anterior teeth', toothNumbers: [8, 9], description: 'Slight yellowing observed on the upper central incisors, likely due to dietary staining from coffee, tea, or wine.', confidence: 85 },
      { id: 'f2', issue: 'Mild Crowding', severity: 'mild', location: 'Lower anterior region', toothNumbers: [23, 24, 25], description: 'Minor overlap detected in the lower front teeth area, indicating slight dental crowding.', confidence: 78 },
      { id: 'f3', issue: 'Early Gum Recession', severity: 'moderate', location: 'Upper right canine', toothNumbers: [6], description: 'Potential early-stage gingival recession noted around the upper right canine, exposing approximately 1-2mm of root surface.', confidence: 65 },
      { id: 'f4', issue: 'Aging Restoration', severity: 'mild', location: 'Lower left first molar', toothNumbers: [19], description: 'An existing amalgam filling showing signs of marginal deterioration that may benefit from evaluation and possible replacement with modern composite.', confidence: 72 },
    ],
    recommendations: [
      { treatment: 'Professional Teeth Whitening', priority: 'low', description: 'In-office or take-home professional whitening can address the extrinsic discoloration and improve overall smile aesthetics by 3-5 shades.', estimatedCostRange: '$300 - $800' },
      { treatment: 'Clear Aligner Consultation', priority: 'medium', description: 'Minor crowding could be addressed with clear aligners (e.g., Invisalign) over 3-6 months for improved alignment and oral hygiene access.', estimatedCostRange: '$2,000 - $5,000' },
      { treatment: 'Periodontal Evaluation', priority: 'high', description: 'Early gum recession should be professionally evaluated to determine cause and prevent progression. May require scaling, root planing, or gum grafting.', estimatedCostRange: '$150 - $300' },
      { treatment: 'Composite Restoration', priority: 'medium', description: 'Replace aging amalgam filling with tooth-colored composite restoration for improved aesthetics and seal integrity.', estimatedCostRange: '$200 - $600' },
    ],
    aestheticAssessment: { symmetry: 82, colorConsistency: 68, gumHealth: 71, alignment: 75, overallAesthetics: 74 },
    summary: 'Overall dental health is good with several areas for cosmetic improvement. Minor discoloration and lower anterior crowding are primarily aesthetic concerns. The early gum recession around tooth #6 warrants priority attention to prevent progression. An aging restoration on tooth #19 should be evaluated for replacement.',
  };
}

// ─── Main Analysis Function ────────────────────
async function analyzeSmile(imageBase64, extraImages) {
  const startTime = Date.now();
  const providers = ['openrouter', 'nvidia', 'huggingface'];
  const primaryProvider = process.env.AI_PROVIDER || 'openrouter';
  const fallbackProvider = process.env.AI_FALLBACK_PROVIDER || 'demo';

  // Build ordered provider chain: primary first, then others, then fallback
  const chain = [primaryProvider, ...providers.filter(p => p !== primaryProvider)];
  if (fallbackProvider === 'demo') chain.push('demo');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  let lastError = null;

  for (const provider of chain) {
    if (provider === 'demo') {
      clearTimeout(timeout);
      return {
        analysis: generateDemoAnalysis(),
        provider: 'demo',
        model: 'built-in',
        processingMs: Date.now() - startTime,
        estimatedCost: 0,
      };
    }

    if (!isProviderHealthy(provider)) {
      console.log(`  ⏭ Skipping unhealthy provider: ${provider}`);
      continue;
    }

    try {
      console.log(`  🧠 Analyzing with ${provider}... (${(extraImages || []).length + 1} image(s))`);

      let result;
      switch (provider) {
        case 'openrouter':
          result = await analyzeWithOpenRouter(imageBase64, controller.signal, extraImages);
          break;
        case 'nvidia':
          result = await analyzeWithNvidia(imageBase64, controller.signal, extraImages);
          break;
        case 'huggingface':
          result = await analyzeWithHuggingFace(imageBase64, controller.signal);
          break;
        default:
          continue;
      }

      const parsed = parseAnalysisResponse(result.raw);
      if (parsed) {
        clearTimeout(timeout);
        console.log(`  ✅ Analysis complete via ${provider} (${Date.now() - startTime}ms)`);
        return {
          analysis: parsed,
          provider,
          model: result.model,
          processingMs: Date.now() - startTime,
          estimatedCost: result.estimatedCost,
          usage: result.usage,
        };
      }

      // Response parsed but invalid — try next provider
      console.warn(`  ⚠ ${provider} returned unparseable response, trying next...`);
      lastError = new Error('Unparseable response');

    } catch (error) {
      lastError = error;
      if (error.name === 'AbortError') {
        markProviderUnhealthy(provider, new Error('Timeout'));
        break; // Don't retry on timeout — all providers share the same controller
      }
      markProviderUnhealthy(provider, error);
      console.error(`  ✗ ${provider} failed: ${error.message}`);
    }
  }

  clearTimeout(timeout);

  // All providers failed — return demo
  console.warn('  ⚠ All providers failed, returning demo analysis');
  return {
    analysis: generateDemoAnalysis(),
    provider: 'demo (fallback)',
    model: 'built-in',
    processingMs: Date.now() - startTime,
    estimatedCost: 0,
    fallbackReason: lastError?.message || 'All providers unavailable',
  };
}

module.exports = {
  analyzeSmile,
  generateDemoAnalysis,
  isProviderHealthy,
};
