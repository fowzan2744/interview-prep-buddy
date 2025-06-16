const RateLimit = require('../models/RateLimit');
 
const checkDailyLimit = (limitType) => {
    return async (req, res, next) => {
        try {
            const userId = req.user.id;
             
            let rateLimit = await RateLimit.findOne({ user: userId });
            
            if (!rateLimit) {
                rateLimit = new RateLimit({ user: userId });
                await rateLimit.save();
            }
             
            if (!rateLimit.isSubscriptionActive() && rateLimit.tier !== 'free') {
                rateLimit.tier = 'free';
                rateLimit.subscriptionStatus = null;
                await rateLimit.save();
            }
            
            // Check if user has exceeded daily limit
            if (rateLimit.hasExceededDailyLimit(limitType)) {
                const limits = rateLimit.getTierLimits()[limitType];
                console.log(`Daily limit exceeded for ${limitType} by user ${userId} is ${limits}`);
                return res.status(429).json({
                    error: `Daily limit exceeded. You can only create ${limits} ${limitType} per day with your ${rateLimit.tier} plan.`,
                    code: 'DAILY_LIMIT_EXCEEDED',
                    limitType,
                    tier: rateLimit.tier,
                    dailyLimit: limits[limitType],
                    remaining: rateLimit.getRemainingUsage(limitType),
                    upgradeRequired: rateLimit.tier === 'free'
                });
            }
             
            req.rateLimit = rateLimit;
            next();
            
        } catch (error) {
            console.error('Rate limit middleware error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

// Middleware to increment usage after successful operation
const incrementDailyUsage = (limitType) => {
    return async (req, res, next) => {
 
        const originalJson = res.json;
         
        res.json = function(data) {
            // Only increment on successful responses (status < 400)
            if (res.statusCode < 400 && req.rateLimit) {
                req.rateLimit.incrementUsage(limitType);
                req.rateLimit.save().catch(err => {
                    console.error('Failed to increment usage:', err);
                });
            }
            return originalJson.call(this, data);
        };
        
        next();
    };
};


// Middleware to get current usage stats
const getDailyUsage = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        let rateLimit = await RateLimit.findOne({ user: userId });
        
        if (!rateLimit) {
            rateLimit = new RateLimit({ user: userId });
            await rateLimit.save();
        }
         
        if (!rateLimit.isSubscriptionActive() && rateLimit.tier !== 'free') {
            rateLimit.tier = 'free';
            rateLimit.subscriptionStatus = null;
            await rateLimit.save();
        }
        
        const limits = rateLimit.getTierLimits();
        
        req.dailyUsage = {
            tier: rateLimit.tier,
            subscriptionStatus: rateLimit.subscriptionStatus,
            sessions: {
                used: rateLimit.dailyLimits.sessions.count,
                remaining: rateLimit.getRemainingUsage('sessions'),
                limit: limits.sessions
            },
            explanations: {
                used: rateLimit.dailyLimits.explanations.count,
                remaining: rateLimit.getRemainingUsage('explanations'),
                limit: limits.explanations
            }
        };
        
        next();
    } catch (error) {
        console.error('Get daily usage error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkDailyLimit,
    incrementDailyUsage,
    getDailyUsage
};