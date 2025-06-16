require('dotenv').config();
const express = require('express')
const path = require('path')
const cors = require('cors')
const PORT = process.env.PORT || 8080

const authRoutes = require('./routes/authRoute')
const sessionRoute = require('./routes/sessionRoute')
const questionRoutes = require('./routes/questionRoute')
const rateLimit = require('./routes/ratelimitRoute')
const {  checkDailyLimit,incrementDailyUsage } = require('./middlewares/ratelimitMiddleware')

const { generateInterviewQuestion, generateInterviewExplanation } = require('./controller/aiController');

const stripe = require('./routes/stripeRoute')
const { protect } = require('./middlewares/authMiddleware')

const connectDB = require('./config/db')
const app = express() 
app.use(express.json());


app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

connectDB();


app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionRoute)
app.use('/api/questions', questionRoutes)

app.use('/api/ai/generate-questions', protect, generateInterviewQuestion)
app.use('/api/ai/generate-explanation', protect  ,checkDailyLimit("explanations"), incrementDailyUsage("explanations"), generateInterviewExplanation)

app.use("/uploads", express.static(path.join(__dirname, 'uploads'),{}))

app.use('/api/rate-limit' ,protect, rateLimit)
app.use('/api/stripe',stripe )

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
