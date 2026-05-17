const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma.cjs');
const { analyzeSmile, generateDemoAnalysis } = require('../services/ai.service.cjs');

// ─── Payload Limits ────────────────────────────
const MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5MB

// ─── Analysis Cache ────────────────────────────
const analysisCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE = 100;

function getCacheKey(img) {
  const snippet = img.substring(0, 1000) + img.length;
  let hash = 0;
  for (let i = 0; i < snippet.length; i++) hash = ((hash << 5) - hash + snippet.charCodeAt(i)) | 0;
  return String(hash);
}

// ─── Analyze Smile Endpoint ────────────────────
router.post('/analyze-smile', async (req, res) => {
  try {
    const { image, images, patientId } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Image is required (base64 encoded)' });
    }
    if (typeof image !== 'string' || image.length > MAX_BASE64_SIZE) {
      return res.status(413).json({ error: 'Image too large. Maximum ~4MB.' });
    }

    // Check cache
    const cacheKey = getCacheKey(image);
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return res.json({ ...cached.data, cached: true });
    }

    // Run analysis through service layer (pass extra images for multi-view)
    const result = await analyzeSmile(image, images);

    // Persist to DB if patientId provided
    if (patientId) {
      try {
        await prisma.aIReport.create({
          data: {
            patientId,
            provider: result.provider,
            model: result.model,
            overallScore: result.analysis.overallScore,
            findings: result.analysis.findings,
            recommendations: result.analysis.recommendations,
            aesthetics: result.analysis.aestheticAssessment,
            summary: result.analysis.summary,
            costEstimate: result.estimatedCost,
            processingMs: result.processingMs,
          },
        });
      } catch (dbErr) {
        console.warn('  ⚠ Failed to persist AI report:', dbErr.message);
        // Don't fail the request if DB write fails
      }
    }

    const response = {
      success: true,
      analysis: result.analysis,
      provider: result.provider,
      model: result.model,
      processingMs: result.processingMs,
      disclaimer: '⚠️ This AI analysis is for educational purposes only. It is NOT a medical diagnosis. Please consult a qualified prosthodontist for professional assessment.',
      analyzedAt: new Date().toISOString(),
    };

    // Cache result
    if (analysisCache.size >= MAX_CACHE) {
      const oldest = analysisCache.keys().next().value;
      analysisCache.delete(oldest);
    }
    analysisCache.set(cacheKey, { data: response, ts: Date.now() });

    res.json(response);
  } catch (error) {
    console.error('AI Analysis Error:', error.message);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

// ─── Get Patient Reports ───────────────────────
router.get('/reports/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId || patientId.length > 50) {
      return res.status(400).json({ error: 'Invalid patient ID' });
    }

    const reports = await prisma.aIReport.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ reports, total: reports.length });
  } catch (error) {
    console.error('Reports Error:', error.message);
    // Fallback to demo data if DB unavailable
    res.json({
      reports: [{
        id: 'demo-1',
        patientId: req.params.patientId,
        analysis: generateDemoAnalysis(),
        provider: 'demo',
        createdAt: new Date().toISOString(),
      }],
      total: 1,
    });
  }
});

// ─── Get Provider Status ───────────────────────
router.get('/providers', (req, res) => {
  res.json({
    providers: [
      { id: 'openrouter', name: 'OpenRouter (Gemini/GPT)', configured: !!process.env.OPENROUTER_API_KEY, model: process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001' },
      { id: 'nvidia', name: 'NVIDIA NIM', configured: !!process.env.NVIDIA_API_KEY, model: process.env.NVIDIA_MODEL || 'meta/llama-4-maverick-17b-128e-instruct' },
      { id: 'huggingface', name: 'HuggingFace', configured: !!process.env.HF_API_KEY, model: process.env.HF_MODEL || 'Salesforce/blip2-opt-2.7b' },
      { id: 'demo', name: 'Demo Mode', configured: true, model: 'built-in' },
    ],
    active: process.env.AI_PROVIDER || 'openrouter',
    fallback: process.env.AI_FALLBACK_PROVIDER || 'demo',
  });
});

module.exports = router;
