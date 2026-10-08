const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/authorizeRoles');
const {
  analyzeSeverity,
  generateSummary,
  getRecommendations,
  matchVolunteers,
  chatCopilot,
  generateDashboardInsights,
  predictResourceShortage,
  generateEmergencyPriorities,
  generateVolunteerBriefing,
  recommendResources
} = require('../controllers/aiController');

// All AI routes require Admin authorization
router.use(authMiddleware);
router.use(authorizeRoles('Administrator'));

router.post('/analyze-severity', analyzeSeverity);
router.post('/generate-summary', generateSummary);
router.post('/recommendations', getRecommendations);
router.post('/match-volunteers', matchVolunteers);
router.post('/chat', chatCopilot);
router.post('/dashboard-insights', generateDashboardInsights);
router.post('/resource-prediction', predictResourceShortage);
router.post('/emergency-priorities', generateEmergencyPriorities);
router.post('/volunteer-briefing', generateVolunteerBriefing);
router.post('/resource-recommendation', recommendResources);

module.exports = router;


