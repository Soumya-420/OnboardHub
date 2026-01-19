const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Import Routes
const analyzeRoute = require('./routes/analyze');
const issuesRoute = require('./routes/issues');

// Use Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/issues', issuesRoute);

app.get('/', (req, res) => {
    res.send('OnboardHub Backend is running 🚀');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
