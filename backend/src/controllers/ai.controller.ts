import { Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';
import prisma from '../lib/prisma';

export class AiController {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE') {
        return res.status(503).json({ error: 'Groq API key not configured. Please add GROQ_API_KEY to your .env file.' });
      }

      const groq = new Groq({ apiKey });

      // Fetch some context from DB to make the AI smart!
      const totalAssets = await prisma.asset.count();
      const openWorkOrders = await prisma.workOrder.count({ where: { status: 'OPEN' } });
      const activeAnomalies = await prisma.anomalyAlert.count({ where: { isResolved: false } });

      const systemPrompt = `You are AssetTrust AI, a highly advanced, professional infrastructure management assistant for a municipal government.
You help admins manage physical assets, work orders, and IoT anomalies. 
Be extremely concise.
Current System State Context:
- Total Assets Tracked: ${totalAssets}
- Open Work Orders: ${openWorkOrders}
- Active Fraud/Risk Anomalies: ${activeAnomalies}

Answer the user's query based on your persona and this context. Keep it under 3 sentences.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        model: 'qwen/qwen3.8-27b',
      });

      const reply = chatCompletion.choices[0]?.message?.content || "I'm having trouble processing that right now.";
      
      res.json({ reply });
    } catch (error) {
      console.error('Groq AI Error:', error);
      res.status(500).json({ error: 'Failed to communicate with AI provider.' });
    }
  }
}

export const aiController = new AiController();
