const express = require('express');
const router = express.Router();
const {protect} = require('../middlewares/authMiddleware');
const RateLimit = require('../models/RateLimit');  

// /api/rate-limit/usage
router.get('/usage', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("User ID:", userId);
         
        let rateLimitDoc = await RateLimit.findOne({ user: userId });
        
        if (!rateLimitDoc) {
            rateLimitDoc = new RateLimit({
                user: userId, 
                tier: 'free', 
                dailyLimits: {
                    sessions: { count: 0, lastReset: new Date() },
                    explanations: { count: 0, lastReset: new Date() }
                }
            });
            await rateLimitDoc.save();
        }

        
        const sessionsRemaining = rateLimitDoc.getRemainingUsage('sessions');
        const explanationsRemaining = rateLimitDoc.getRemainingUsage('explanations');
         
        const limits = rateLimitDoc.getTierLimits();
 
        const sessionsUsed = limits.sessions === -1 ? 0 : 
            Math.max(0, limits.sessions - sessionsRemaining);
        const explanationsUsed = limits.explanations === -1 ? 0 : 
            Math.max(0, limits.explanations - explanationsRemaining);

        const usageData = {
            tier: rateLimitDoc.tier,
            sessions: {
                remaining: sessionsRemaining,
                used: sessionsUsed,
                limit: limits.sessions
            },
            explanations: {
                remaining: explanationsRemaining,
                used: explanationsUsed,
                limit: limits.explanations
            },
            subscriptionStatus: rateLimitDoc.subscriptionStatus,
            isSubscriptionActive: rateLimitDoc.isSubscriptionActive(),
            lastUpdated: new Date().toISOString()
        };

        res.status(200).json(usageData);
        
    } catch (error) {
        console.error('Error fetching usage data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch usage data',
            error: error.message
        });
    }
});

module.exports = router;