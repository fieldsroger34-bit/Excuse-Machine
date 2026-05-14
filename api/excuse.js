const Anthropic = require('@anthropic-ai/sdk');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { category, urgency, context, isPremium } = req.body;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const urgencyMap = {
    mild: 'plausible, polite, and low-risk',
    bold: 'dramatic but still believable',
    nuclear: 'over-the-top, maximum drama, pulling out all the stops',
  };

  const prompt = `Generate a single creative, convincing excuse for this situation:
Category: ${category}
Urgency: ${urgencyMap[urgency] || urgencyMap.mild}
Extra context: ${context || 'none'}
Premium user: ${isPremium ? 'yes — make it extra creative and detailed' : 'no — keep it simple but effective'}

Rules:
- Return ONLY the excuse text, nothing else
- No quotes around it
- 2-4 sentences
- Sound natural and human
- Make it specific and believable
- Do not include any explanation or meta-commentary`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });
    const excuse = message.content[0].text.trim();
    res.status(200).json({ excuse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Generation failed' });
  }
};
