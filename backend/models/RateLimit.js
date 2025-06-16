const mongoose = require('mongoose');

const rateLimitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    tier: {
        type: String,
        enum: ['free', 'premium', 'luxury'],
        default: 'free'
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    stripeSubscriptionId: {
        type: String,
        default: null
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete'],
        default: null
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    },
    dailyLimits: {
        sessions: {
            count: {
                type: Number,
                default: 0
            },
            lastReset: {
                type: Date,
                default: Date.now
            }
        },
        explanations: {
            count: {
                type: Number,
                default: 0
            },
            lastReset: {
                type: Date,
                default: Date.now
            }
        }
    }
}, {
    timestamps: true
});

//limits for each tier
const TIER_LIMITS = {
    free: { sessions: 1, explanations: 3 },
    premium: { sessions: 20, explanations: 50 },
    luxury: { sessions: -1, explanations: -1 } // -1 means unlimited
};


rateLimitSchema.methods.getTierLimits = function() {
    return TIER_LIMITS[this.tier] || TIER_LIMITS.free;
};

// if daily limit is exceeded
rateLimitSchema.methods.hasExceededDailyLimit = function(type) {
    const limits = this.getTierLimits();
    
    // Unlimited luxury tier
    if (limits[type] === -1) {
        return false;
    }
    
    const today = new Date();
    
    // new day counter reset
    const lastReset = this.dailyLimits[type].lastReset;
    const isNewDay = today.toDateString() !== lastReset.toDateString();
    
    if (isNewDay) {
        this.dailyLimits[type].count = 0;
        this.dailyLimits[type].lastReset = today;
    }
    
    return this.dailyLimits[type].count >= limits[type];
};


// Increment usage
rateLimitSchema.methods.incrementUsage = function(type) {
    const limits = this.getTierLimits();
    
    // Don't increment for unlimited tier
    if (limits[type] === -1) {
        return;
    }
    
    const today = new Date();
    const lastReset = this.dailyLimits[type].lastReset;
    const isNewDay = today.toDateString() !== lastReset.toDateString();
    
    if (isNewDay) {
        this.dailyLimits[type].count = 1;
        this.dailyLimits[type].lastReset = today;
    } else {
        this.dailyLimits[type].count += 1;
    }
};



// Get remaining usage
rateLimitSchema.methods.getRemainingUsage = function(type) {
    const limits = this.getTierLimits();
     
    // Unlimited luxury tier
    if (limits[type] === -1) {
        return -1; 
    }
    
    const today = new Date();
    const lastReset = this.dailyLimits[type].lastReset;
    const isNewDay = today.toDateString() !== lastReset.toDateString();
    
    if (isNewDay) {
        return limits[type];
    }
    
    return Math.max(0, limits[type] - this.dailyLimits[type].count);
};



// upgrade tier
rateLimitSchema.methods.upgradeTier = function(newTier, stripeData = {}) {
    this.tier = newTier;
    if (stripeData.customerId) this.stripeCustomerId = stripeData.customerId;
    if (stripeData.subscriptionId) this.stripeSubscriptionId = stripeData.subscriptionId;
    if (stripeData.status) this.subscriptionStatus = stripeData.status;
    if (stripeData.endDate) this.subscriptionEndDate = stripeData.endDate;
};


rateLimitSchema.methods.isSubscriptionActive = function() {
    if (this.tier === 'free') return true;
    
    const now = new Date();
    return this.subscriptionStatus === 'active' && 
           (!this.subscriptionEndDate || this.subscriptionEndDate > now);
};

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
module.exports = RateLimit;