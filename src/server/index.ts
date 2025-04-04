import express from 'express';
import cors from 'cors';
import alertsRouter from './routes/alerts.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/alerts', alertsRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 