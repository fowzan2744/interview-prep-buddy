// routes/stripe.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const RateLimit = require('../models/RateLimit');  
const {protect} = require('../middlewares/authMiddleware');  

// user's current subscription info
router.get('/subscription-info', protect, async (req, res) => {
    try {
        const rateLimit = await RateLimit.findOne({ user: req.user.id });
        
        if (!rateLimit) {
            return res.status(404).json({ error: 'Rate limit record not found' });
        }

        res.json({
            tier: rateLimit.tier,
            subscriptionStatus: rateLimit.subscriptionStatus,
            subscriptionEndDate: rateLimit.subscriptionEndDate,
            isActive: rateLimit.isSubscriptionActive()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



//makefreetier
router.post('/freetier', protect, async (req, res) => {
    try {
        const rateLimit = await RateLimit.findOne({ user: req.user.id });
        
        if (!rateLimit) {
            return res.status(404).json({ error: 'Rate limit record not found' });
        }

        rateLimit.tier = "free"; 
        rateLimit.subscriptionStatus = "active";
        rateLimit.stripeSubscriptionId = null;
        rateLimit.stripeCustomerId = null;
        rateLimit.subscriptionEndDate = null; 

        rateLimit.save();

        res.json({
            tier: rateLimit.tier,
            subscriptionStatus: rateLimit.subscriptionStatus,
            subscriptionEndDate: rateLimit.subscriptionEndDate,
            isActive: rateLimit.isSubscriptionActive()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.post('/verify-payment', protect, async (req, res) => {
    try {
        const { sessionId, tier } = req.body;

        if (!sessionId || !tier) {
            return res.status(400).json({ error: 'Session ID and tier are required' });
        }
        console.log("Session ID:", sessionId);
 
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return res.status(400).json({ error: 'Payment not completed' });
        } 

        function isValidDate(date) {
            return date instanceof Date && !isNaN(date.getTime());
        }
 
        let subscriptionEndDate = null;
        let subscriptionData = {};

        if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log("Subscription Data:", subscription);
             
            if (subscription.start_date && subscription.plan) {
                const startDate = new Date(subscription.start_date * 1000);
                 
                if (subscription.plan.interval === 'month') {
                    const monthsToAdd = subscription.plan.interval_count || 1;
                    subscriptionEndDate = new Date(startDate);
                    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + monthsToAdd);
                } else if (subscription.plan.interval === 'year') {
                    const yearsToAdd = subscription.plan.interval_count || 1;
                    subscriptionEndDate = new Date(startDate);
                    subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + yearsToAdd);
                } else if (subscription.plan.interval === 'week') {
                    const weeksToAdd = subscription.plan.interval_count || 1;
                    subscriptionEndDate = new Date(startDate.getTime() + (weeksToAdd * 7 * 24 * 60 * 60 * 1000));
                } else if (subscription.plan.interval === 'day') {
                    const daysToAdd = subscription.plan.interval_count || 1;
                    subscriptionEndDate = new Date(startDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                }
                 
                if (!isValidDate(subscriptionEndDate)) {
                    subscriptionEndDate = null;
                }
            }
             
            if (!subscriptionEndDate && subscription.current_period_end) {
                const endDate = new Date(subscription.current_period_end * 1000);
                subscriptionEndDate = isValidDate(endDate) ? endDate : null;
            }
            
            subscriptionData = {
                customerId: session.customer,
                subscriptionId: session.subscription,
                status: subscription.status,
                endDate: subscriptionEndDate
            };
        } else { 
            subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);  
            subscriptionData = {
                customerId: session.customer,
                status: 'active',
                endDate: subscriptionEndDate
            };
        }

        console.log("Processed Subscription Data:", subscriptionData);
 
        let rateLimit = await RateLimit.findOne({ user: req.user.id });
        
        if (!rateLimit) {
            rateLimit = new RateLimit({ user: req.user.id });
        }
        
 
        rateLimit.tier = tier; 
        rateLimit.subscriptionStatus = subscriptionData.status;
        rateLimit.stripeSubscriptionId = subscriptionData.subscriptionId;
        rateLimit.stripeCustomerId = subscriptionData.customerId;
        rateLimit.subscriptionEndDate = subscriptionEndDate;  
    
        await rateLimit.save();

        res.json({
            success: true,
            message: `Successfully upgraded to ${tier} tier`,
            tier: rateLimit.tier,
            subscriptionStatus: rateLimit.subscriptionStatus,
            subscriptionEndDate: rateLimit.subscriptionEndDate
        });

    } catch (error) {
        console.error('Payment verification error:', error);
         
        if (error.name === 'ValidationError') {
            console.error('Validation errors:', error.errors);
            return res.status(400).json({ 
                error: 'Data validation failed', 
                details: Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                }))
            });
        }
        
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});


 


router.get('/check-subscription/:userId', protect, async (req, res) => {
    try {
        const rateLimit = await RateLimit.findOne({ user: req.params.userId });
        
        if (!rateLimit || !rateLimit.stripeSubscriptionId) {
            return res.json({ isActive: false });
        }
 
        const subscription = await stripe.subscriptions.retrieve(rateLimit.stripeSubscriptionId);
         
        if (subscription.status !== rateLimit.subscriptionStatus) {
            rateLimit.subscriptionStatus = subscription.status;
            rateLimit.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
             
            if (!['active', 'trialing'].includes(subscription.status)) {
                rateLimit.tier = 'free';
            }
            
            await rateLimit.save();
        }

        res.json({
            isActive: rateLimit.isSubscriptionActive(),
            tier: rateLimit.tier,
            status: rateLimit.subscriptionStatus
        });

    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ error: 'Failed to check subscription' });
    }
});

module.exports = router;