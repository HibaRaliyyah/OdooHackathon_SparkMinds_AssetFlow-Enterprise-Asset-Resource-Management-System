import { Response } from 'express';
import Asset from '../models/Asset';
import Maintenance from '../models/Maintenance';
import OpenAI from 'openai';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../middlewares/auth.middleware';

const client = new OpenAI({
  baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: { 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'AssetFlow' },
});

// Rule-based health score
const computeHealthScore = (asset: {
  condition: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  lastAuditDate?: Date;
}): number => {
  let score = 100;
  const conditionMap: Record<string, number> = { excellent: 0, good: 5, fair: 20, poor: 40, damaged: 60 };
  score -= conditionMap[asset.condition] || 0;

  if (asset.purchaseDate) {
    const ageYears = (Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    score -= Math.min(30, ageYears * 5);
  }

  if (asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date()) {
    score -= 10;
  }

  if (asset.lastAuditDate) {
    const daysSinceAudit = (Date.now() - new Date(asset.lastAuditDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceAudit > 180) score -= 5;
  } else {
    score -= 5;
  }

  return Math.max(0, Math.round(score));
};

export const getHealthScores = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assets = await Asset.find({ status: { $ne: 'disposed' } })
      .populate('category', 'name')
      .populate('department', 'name')
      .select('name assetId condition purchaseDate warrantyExpiry lastAuditDate status')
      .limit(10); // Limit to 10 for AI processing speed

    const prompt = `You are an AI assistant. I will provide a list of assets. For each asset, compute a health score from 0 to 100 based on its condition (excellent=90-100, good=70-89, fair=50-69, poor=30-49, damaged=0-29), age, and warranty status.
    
Assets:
${assets.map(a => `- ID: ${a._id}, Name: ${a.name}, Condition: ${a.condition}, Age: ${a.purchaseDate ? Math.round((Date.now() - new Date(a.purchaseDate).getTime())/(1000*3600*24*365)) : 0} years, Warranty Expired: ${a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date() ? 'Yes' : 'No'}`).join('\n')}

Return STRICTLY a JSON array of objects, where each object has:
- id: the exact ID string provided
- healthScore: an integer from 0 to 100
No markdown, no explanation, only the JSON array.`;

    let scoredMap: Record<string, number> = {};
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const completion = await client.chat.completions.create({
          model: process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
        });
        const content = completion.choices[0]?.message?.content || '';
        const match = content.match(/\[.*\]/s);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (Array.isArray(parsed)) {
            parsed.forEach((p: any) => {
              if (p.id && typeof p.healthScore === 'number') {
                scoredMap[p.id] = p.healthScore;
              }
            });
          }
        }
      } catch (e) {
        console.error('AI HealthScore Error:', e);
      }
    }

    const scored = assets.map((a) => {
      let score = scoredMap[a._id.toString()];
      if (typeof score !== 'number') {
        score = computeHealthScore(a as any); // Fallback to rule-based
      }
      return {
        id: a._id,
        assetId: a.assetId,
        name: a.name,
        condition: a.condition,
        healthScore: score,
        status: a.status,
      };
    });

    // Update health scores in DB
    await Promise.all(scored.map(s => Asset.findByIdAndUpdate(s.id, { healthScore: s.healthScore })));

    sendSuccess(res, scored);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getPredictions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [warrantyExpiring, overdueAudit, agingAssets] = await Promise.all([
      Asset.find({ warrantyExpiry: { $lte: thirtyDaysFromNow, $gte: new Date() } })
        .populate('department', 'name').select('name assetId warrantyExpiry department').limit(10),
      Asset.find({ $or: [{ lastAuditDate: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } }, { lastAuditDate: { $exists: false } }] })
        .select('name assetId lastAuditDate').limit(10),
      Asset.find({ purchaseDate: { $lt: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000) }, status: { $ne: 'disposed' } })
        .select('name assetId purchaseDate condition').limit(10),
    ]);

    sendSuccess(res, { warrantyExpiring, overdueAudit, agingAssets });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const naturalLanguageSearch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.body;
    if (!query) { sendError(res, 'Query is required', 400); return; }

    // Rule-based NLP parsing
    const lower = query.toLowerCase();
    const filter: Record<string, unknown> = {};

    if (lower.includes('maintenance') || lower.includes('under repair')) filter.status = 'under_maintenance';
    else if (lower.includes('available')) filter.status = 'available';
    else if (lower.includes('allocated') || lower.includes('assigned')) filter.status = 'allocated';
    else if (lower.includes('disposed')) filter.status = 'disposed';

    if (lower.includes('laptop') || lower.includes('computer')) filter.$text = { $search: 'laptop computer' };
    else if (lower.includes('phone') || lower.includes('mobile')) filter.$text = { $search: 'phone mobile' };
    else if (lower.includes('vehicle') || lower.includes('car')) filter.$text = { $search: 'vehicle car' };
    else if (lower.includes('projector')) filter.$text = { $search: 'projector' };
    else if (lower.includes('furniture') || lower.includes('chair') || lower.includes('desk')) filter.$text = { $search: 'furniture chair desk' };

    // Use OpenRouter AI for better parsing if simple rules don't extract intent
    let aiInsight = '';
    try {
      if (process.env.OPENROUTER_API_KEY) {
        const completion = await client.chat.completions.create({
          model: process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
          messages: [
            { role: 'system', content: 'You are an asset management assistant. Extract search intent from user queries. Reply with a JSON object containing: { status, category, search }. Use null for fields not mentioned.' },
            { role: 'user', content: query },
          ],
          max_tokens: 150,
        });
        aiInsight = completion.choices[0]?.message?.content || '';
        try {
          const parsed = JSON.parse(aiInsight);
          if (parsed.status && !filter.status) filter.status = parsed.status;
          if (parsed.search && !filter.$text) filter.$text = { $search: parsed.search };
        } catch { /* use rule-based */ }
      }
    } catch { /* AI unavailable, use rule-based results */ }

    const assets = await Asset.find(Object.keys(filter).length > 0 ? filter : {})
      .populate('category', 'name')
      .populate('department', 'name')
      .populate('assignedTo', 'firstName lastName')
      .limit(20);

    let summary = '';
    if (assets.length === 0) {
      summary = 'I could not find any assets matching your query.';
    } else {
      summary = `I found ${assets.length} asset(s) matching your query:\n\n` + 
        assets.map(a => `- ${a.name} (${a.assetId}): Status is ${a.status}, Condition is ${a.condition}`).join('\n');
    }

    sendSuccess(res, { assets, query, parsedFilter: filter, summary });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getDashboardInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assets = await Asset.find({ status: { $ne: 'disposed' } }).select('condition purchaseDate warrantyExpiry');
    const maintenance = await Maintenance.find({ status: 'pending' });

    const prompt = `You are an AI assistant for an enterprise asset management system. 
Analyze the following system summary:
- Total Assets: ${assets.length}
- Assets in poor/damaged condition: ${assets.filter(a => ['poor', 'damaged'].includes(a.condition)).length}
- Assets with expired warranty: ${assets.filter(a => a.warrantyExpiry && new Date(a.warrantyExpiry) < new Date()).length}
- Pending maintenance requests: ${maintenance.length}

Generate exactly 3 proactive insights or recommendations based on this data.
Return STRICTLY a JSON array of objects. Each object must have:
- type: "warning", "error", "success", or "info"
- message: a concise professional recommendation (max 1 sentence)
No extra text, no markdown format.`;

    let insights: any[] = [];
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const completion = await client.chat.completions.create({
          model: process.env.AI_MODEL || 'mistralai/mistral-7b-instruct:free',
          messages: [{ role: 'user', content: prompt }],
        });
        const content = completion.choices[0]?.message?.content || '';
        const match = content.match(/\[.*\]/s);
        if (match) {
          insights = JSON.parse(match[0]);
        }
      } catch (e) {
        console.error('AI Insight Error:', e);
      }
    }

    if (!insights || insights.length === 0) {
      // Fallback
      insights = [
        { type: 'info', message: `Total portfolio: ${assets.length} active assets tracked in the system.` }
      ];
    }

    sendSuccess(res, insights);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
