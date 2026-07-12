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
      .limit(50);

    const scored = assets.map((a) => ({
      id: a._id,
      assetId: a.assetId,
      name: a.name,
      condition: a.condition,
      healthScore: computeHealthScore(a),
      status: a.status,
    }));

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

    sendSuccess(res, { assets, query, parsedFilter: filter });
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};

export const getDashboardInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalAssets, poorCondition, expiredWarranty, pendingMaintenance] = await Promise.all([
      Asset.countDocuments({ status: { $ne: 'disposed' } }),
      Asset.countDocuments({ condition: { $in: ['poor', 'damaged'] } }),
      Asset.countDocuments({ warrantyExpiry: { $lt: new Date() } }),
      Maintenance.countDocuments({ status: 'pending' }),
    ]);

    const insights = [];

    if (poorCondition > 0) {
      insights.push({ type: 'warning', icon: 'AlertTriangle', message: `${poorCondition} asset(s) in poor/damaged condition need immediate attention.`, action: 'Review Assets' });
    }
    if (expiredWarranty > 0) {
      insights.push({ type: 'error', icon: 'Shield', message: `${expiredWarranty} asset(s) have expired warranties. Consider renewal or replacement.`, action: 'View Assets' });
    }
    if (pendingMaintenance > 5) {
      insights.push({ type: 'warning', icon: 'Wrench', message: `${pendingMaintenance} maintenance requests are pending approval.`, action: 'Review Requests' });
    }
    insights.push({ type: 'info', icon: 'TrendingUp', message: `Total portfolio: ${totalAssets} active assets tracked in the system.` });

    sendSuccess(res, insights);
  } catch (err: unknown) { sendError(res, (err as Error).message, 500); }
};
