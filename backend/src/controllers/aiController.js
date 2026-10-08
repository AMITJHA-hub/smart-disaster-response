const Emergency = require('../models/Emergency');
const User = require('../models/User');

// AI Feature Fallback Implementations using heuristic data synthesis.
// These emulate an LLM by parsing actual application context.
// In a real production deployment with an API key, this would route to aiService.js

exports.analyzeSeverity = async (req, res) => {
  try {
    const { emergency } = req.body;
    if (!emergency) return res.status(400).json({ message: 'Emergency data required' });
    
    // Heuristic analysis
    const isCritical = emergency.category.toLowerCase().includes('fire') || 
                       emergency.category.toLowerCase().includes('flood') || 
                       emergency.description.toLowerCase().includes('life');
    
    let severity = isCritical ? 'CRITICAL' : 'HIGH';
    let score = isCritical ? 92 : 78;
    
    res.json({
      severity,
      confidence: score,
      reason: `Reported ${emergency.category.toLowerCase()} near ${emergency.location} may affect multiple residents and requires immediate response based on the incident description.`
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};

exports.generateSummary = async (req, res) => {
  try {
    const { emergency } = req.body;
    if (!emergency) return res.status(400).json({ message: 'Emergency data required' });
    
    res.json({
      summary: `${emergency.category} emergency reported in ${emergency.location}.`,
      priority: emergency.status === 'Pending' ? 'Critical' : 'High',
      concern: `The incident in ${emergency.location} requires rapid assessment and possible resource deployment.`,
      focus: [
        'Assess affected residents',
        'Deploy available volunteers',
        'Verify resource requirements',
        'Monitor incident status'
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { emergency } = req.body;
    if (!emergency) return res.status(400).json({ message: 'Emergency data required' });
    
    res.json({
      recommendations: [
        {
          action: 'Verify affected area',
          reason: `Establish exact severity of the ${emergency.category.toLowerCase()} at ${emergency.location}.`
        },
        {
          action: 'Assign available rescue-trained volunteers',
          reason: 'Incident description indicates a need for active operational support.'
        },
        {
          action: 'Check critical resource availability',
          reason: 'To ensure response teams are fully equipped before dispatch.'
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};

exports.matchVolunteers = async (req, res) => {
  try {
    const { emergency, volunteers } = req.body;
    if (!emergency || !volunteers) return res.status(400).json({ message: 'Required data missing' });
    
    // Create a heuristic ranking
    const ranked = volunteers.map(vol => {
      let score = 50;
      if (vol.availability) score += 20;
      
      // Check area match
      if (vol.area && emergency.location && 
          emergency.location.toLowerCase().includes(vol.area.toLowerCase())) {
        score += 15;
      }
      
      // Check skills
      const hasUsefulSkill = vol.skills && vol.skills.some(s => 
        ['first aid', 'rescue', 'driving', 'medical'].includes(s.toLowerCase())
      );
      if (hasUsefulSkill) score += 15;
      
      return {
        ...vol,
        matchScore: Math.min(score, 99),
        reason: `Match based on availability${hasUsefulSkill ? ', operational skills,' : ''} and proximity.`
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    res.json({ recommendedVolunteers: ranked });
  } catch (error) {
    res.status(500).json({ message: 'AI Analysis Failed' });
  }
};

exports.chatCopilot = async (req, res) => {
  try {
    const { message, context } = req.body;

    // Fallback heuristic function
    const getHeuristicResponse = (msg, ctx) => {
      let resp = "I am analyzing the current data. Based on the operational context provided, everything appears stable.";
      if (msg.includes('attention') || msg.includes('priority')) {
        const pending = ctx.emergencies?.filter(e => e.status === 'Pending') || [];
        if (pending.length > 0) {
          resp = `Based on the current records, you have ${pending.length} pending emergencies that require immediate verification. The incident "${pending[0].category}" at ${pending[0].location} should be addressed first.`;
        } else {
          resp = `Currently, there are no pending emergencies. All reported incidents are either being addressed or have been resolved.`;
        }
      } else if (msg.includes('volunteer')) {
        const available = ctx.volunteers?.filter(v => v.availability) || [];
        resp = `There are currently ${available.length} volunteers marked as available for deployment.`;
      } else if (msg.includes('resource') || msg.includes('shortage')) {
        resp = `I have analyzed the resource allocations. Please check the Resources tab to see any partially fulfilled requirements.`;
      } else if (msg.includes('summary') || msg.includes('situation')) {
        resp = `System Summary: You have ${ctx.emergencies?.length || 0} total emergencies tracked. Response operations are proceeding according to the active status markers.`;
      } else {
        resp = `I understand you are asking about "${message}". As the AI Copilot, I am monitoring ${ctx.emergencies?.length || 0} emergencies and ${ctx.volunteers?.length || 0} volunteers.`;
      }
      return resp;
    };

    // Check if the API key is present
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ response: getHeuristicResponse(message.toLowerCase(), context) });
    }

    // Dynamic import to avoid crash if module is not installed yet
    let GoogleGenAI;
    try {
      const pkg = require('@google/genai');
      GoogleGenAI = pkg.GoogleGenAI;
    } catch (e) {
      return res.status(500).json({ message: 'The @google/genai package is not installed.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const userRole = context.role || 'Administrator';
    const systemInstruction = `You are an AI Response Copilot for the Smart Disaster Response application. 
    You are assisting a system ${userRole}. Be professional, concise, and helpful.
    Use the following operational context to answer the user's questions:
    
    Emergencies: ${JSON.stringify(context.emergencies || [])}
    Volunteers: ${JSON.stringify(context.volunteers || [])}
    Resources: ${JSON.stringify(context.resources || [])}
    
    If the user asks a question, answer it directly using only the provided context. If the context doesn't contain the answer, say you don't have that information. Do not expose the raw JSON.`;

    try {
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2
        }
      });
      return res.json({ response: aiResponse.text });
    } catch (apiErr) {
      console.warn("Google API Failed (e.g. 503 High Demand). Falling back to heuristics...");
      return res.json({ response: getHeuristicResponse(message.toLowerCase(), context) });
    }
    
  } catch (error) {
    console.error('AI Controller Error:', error);
    res.status(500).json({ message: 'AI Communication Failed' });
  }
};

// New AI feature: Generate concise dashboard insights for administrators
exports.generateDashboardInsights = async (req, res) => {
  try {
    const { emergencies, volunteers, resources } = req.body;
    const heuristic = () => {
      const pending = emergencies?.filter(e => e.status === 'Pending').length || 0;
      const ongoing = emergencies?.filter(e => e.status === 'Ongoing').length || 0;
      const availableVolunteers = volunteers?.filter(v => v.availability).length || 0;
      return `Platform Status:\n• ${pending} pending emergencies waiting for verification\n• ${ongoing} active operations\n• ${availableVolunteers} volunteers ready for deployment\n\nOverall system is stable, but pending cases should be verified immediately.`;
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ insight: heuristic() });
    }
    let GoogleGenAI;
    try { const pkg = require('@google/genai'); GoogleGenAI = pkg.GoogleGenAI; } catch (e) { return res.status(500).json({ message: 'Gemini package missing' }); }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are an AI assistant for the Smart Disaster Response admin dashboard. Summarize the overall situation in a short, actionable paragraph. Do not use markdown asterisks. Use simple bullet points. Do not include raw JSON.
Emergencies: ${JSON.stringify(emergencies || [])}
Volunteers: ${JSON.stringify(volunteers || [])}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemInstruction,
        config: { temperature: 0.2 }
      });
      return res.json({ insight: response.text });
    } catch (apiErr) {
      console.warn('Gemini API error (Insights):', apiErr.message);
      return res.json({ insight: heuristic() });
    }
  } catch (err) {
    console.error('Dashboard insights error:', err);
    res.status(500).json({ message: 'AI Dashboard Insight Failed' });
  }
};

// New AI feature: Predict resource shortage based on current allocations
exports.predictResourceShortage = async (req, res) => {
  try {
    const { resources } = req.body;
    const heuristic = () => {
      const atRisk = resources?.filter(r => r.quantity <= r.threshold) || [];
      if (atRisk.length) {
        return `Critical Shortage Alert:\n${atRisk.map(r => `• ${r.name} (Only ${r.quantity} left)`).join('\n')}\n\nImmediate replenishment is highly recommended to sustain ongoing operations.`;
      }
      return 'All resources are well-stocked and within safe operational limits.\nNo immediate action required.';
    };
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ prediction: heuristic() });
    }
    let GoogleGenAI;
    try { const pkg = require('@google/genai'); GoogleGenAI = pkg.GoogleGenAI; } catch (e) { return res.status(500).json({ message: 'Gemini package missing' }); }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `Given the following resource data, predict which resources might face shortage soon. Provide a concise bullet list without markdown asterisks.
Resources: ${JSON.stringify(resources || [])}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemInstruction,
        config: { temperature: 0.2 }
      });
      return res.json({ prediction: response.text });
    } catch (apiErr) {
      console.warn('Gemini API error (Resource):', apiErr.message);
      return res.json({ prediction: heuristic() });
    }
  } catch (err) {
    console.error('Resource prediction error:', err);
    res.status(500).json({ message: 'AI Resource Prediction Failed' });
  }
};

// New AI feature: Recommend resources to add for a disaster
exports.recommendResources = async (req, res) => {
  try {
    const { category, location } = req.body;
    const heuristic = () => {
      let defaults = ['Water Bottles', 'First Aid Kits', 'Flashlights'];
      if (category === 'Flood') defaults = ['Sandbags', 'Life Jackets', 'Water Pumps', 'Blankets'];
      if (category === 'Fire') defaults = ['Fire Extinguishers', 'Burn Kits', 'Respirators', 'Water'];
      if (category === 'Earthquake') defaults = ['Heavy Duty Gloves', 'Helmets', 'Medical Supplies', 'Tents'];
      return `Recommended Resources for ${category} in ${location}:\n• ${defaults.join('\n• ')}\n\nPlease add these resources to ensure a proper response.`;
    };
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ recommendation: heuristic() });
    }
    let GoogleGenAI;
    try { const pkg = require('@google/genai'); GoogleGenAI = pkg.GoogleGenAI; } catch (e) { return res.status(500).json({ message: 'Gemini package missing' }); }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are a disaster response expert. Recommend a concise bulleted list of 4-5 essential physical resources (e.g. Blankets, Water, Medical Kits) that should be allocated for a ${category} emergency in ${location}. Do not use markdown asterisks. Format with simple bullet points.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemInstruction,
        config: { temperature: 0.3 }
      });
      return res.json({ recommendation: response.text });
    } catch (apiErr) {
      console.warn('Gemini API error (Resource Recommendation):', apiErr.message);
      return res.json({ recommendation: heuristic() });
    }
  } catch (err) {
    console.error('Resource recommendation error:', err);
    res.status(500).json({ message: 'AI Resource Recommendation Failed' });
  }
};

// New AI feature: Generate prioritized list of emergencies for admin
exports.generateEmergencyPriorities = async (req, res) => {
  try {
    const { emergencies } = req.body;
    const heuristic = () => {
      const sorted = [...(emergencies || [])].sort((a, b) => {
        const sevOrder = { CRITICAL: 2, HIGH: 1, MEDIUM: 0 };
        const aScore = sevOrder[a.severity?.toUpperCase()] || 0;
        const bScore = sevOrder[b.severity?.toUpperCase()] || 0;
        if (aScore !== bScore) return bScore - aScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      if (sorted.length === 0) return 'No active emergencies to prioritize.';
      return `Top Priorities:\n${sorted.slice(0, 3).map((e, i) => `${i + 1}. ${e.category} at ${e.location}`).join('\n')}\n\nDispatch verification teams to these areas immediately.`;
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ priorities: heuristic() });
    }
    let GoogleGenAI;
    try { const pkg = require('@google/genai'); GoogleGenAI = pkg.GoogleGenAI; } catch (e) { return res.status(500).json({ message: 'Gemini package missing' }); }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are an AI assistant for emergency management. Given the list of emergencies, output a concise prioritized list with the most critical incidents first. Do not use markdown asterisks.
Emergencies: ${JSON.stringify(emergencies || [])}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemInstruction,
        config: { temperature: 0.2 }
      });
      return res.json({ priorities: response.text });
    } catch (apiErr) {
      console.warn('Gemini API error (Priorities):', apiErr.message);
      return res.json({ priorities: heuristic() });
    }
  } catch (err) {
    console.error('Emergency priorities error:', err);
    res.status(500).json({ message: 'AI Emergency Priorities Failed' });
  }
};

// New AI feature: Generate a briefing for a volunteer about assigned emergencies
exports.generateVolunteerBriefing = async (req, res) => {
  try {
    const { volunteer, assignedEmergencies } = req.body;
    const heuristic = () => {
      if (!assignedEmergencies || assignedEmergencies.length === 0) {
        return `Hello ${volunteer?.name || 'Volunteer'},\n\nYou currently have no assigned tasks. Please standby for deployment orders.`;
      }
      return `Mission Briefing for ${volunteer?.name || 'Volunteer'}\n\nYou have been assigned to ${assignedEmergencies.length} critical tasks:\n${assignedEmergencies.map(e => `• ${e.category} at ${e.location}`).join('\n')}\n\nPlease proceed to these locations carefully and update your status in the app.`;
    };

    if (!process.env.GEMINI_API_KEY) {
      return res.json({ briefing: heuristic() });
    }
    let GoogleGenAI;
    try { const pkg = require('@google/genai'); GoogleGenAI = pkg.GoogleGenAI; } catch (e) { return res.status(500).json({ message: 'Gemini package missing' }); }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const systemInstruction = `You are an AI assistant preparing a briefing for a volunteer. Summarize the emergencies they are assigned to in a friendly and concise manner. Do not use markdown asterisks.
Volunteer: ${JSON.stringify(volunteer || {})}
Assigned Emergencies: ${JSON.stringify(assignedEmergencies || [])}`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemInstruction,
        config: { temperature: 0.2 }
      });
      return res.json({ briefing: response.text });
    } catch (apiErr) {
      console.warn('Gemini API error (Briefing):', apiErr.message);
      return res.json({ briefing: heuristic() });
    }
  } catch (err) {
    console.error('Volunteer briefing error:', err);
    res.status(500).json({ message: 'AI Volunteer Briefing Failed' });
  }
};

