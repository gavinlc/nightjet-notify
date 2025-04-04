import express, { Request, Response, Router, RequestHandler } from 'express';
import { Alert } from '../../services/alertService.js';
import { getTrainOffers } from '../../services/api.js';
import nodemailer from 'nodemailer';

const router: Router = express.Router();

// In-memory storage for alerts
const alerts: Alert[] = [];

// Email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Create a new alert
router.post('/', async (req: Request, res: Response) => {
    try {
        const alert: Alert = {
            id: Math.random().toString(36).substring(7),
            ...req.body,
            createdAt: new Date(),
            lastChecked: new Date(),
        };
        alerts.push(alert);
        res.status(201).json(alert);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create alert' });
    }
});

// Check all alerts for available tickets
router.get('/check', async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Only check alerts that haven't been checked in the last hour
        const alertsToCheck = alerts.filter(alert => alert.lastChecked?.getTime() ?? 0 < oneHourAgo.getTime());

        for (const alert of alertsToCheck) {
            // Convert date string to timestamp (assuming date is in DDMMYYYY format)
            const [day, month, year] = alert.date.match(/(\d{2})(\d{2})(\d{4})/)?.slice(1) || [];
            const timestamp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();

            const offer = await getTrainOffers(alert.trainNumber, alert.from, alert.to, timestamp);

            if (offer && (offer.bestOffers.be || offer.bestOffers.le || offer.bestOffers.se)) {
                // Send email notification
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: alert.email,
                    subject: 'NightJet Tickets Available!',
                    html: `
                        <h1>NightJet Tickets Available!</h1>
                        <p>Good news! Tickets are now available for your selected train:</p>
                        <ul>
                            <li>Train: ${alert.trainNumber}</li>
                            <li>Date: ${alert.date}</li>
                            <li>From: ${alert.from}</li>
                            <li>To: ${alert.to}</li>
                        </ul>
                        <p>Click <a href="${process.env.FRONTEND_URL}">here</a> to book your tickets!</p>
                    `,
                });
            }

            // Update last checked time
            alert.lastChecked = now;
        }

        res.json({ message: 'Alerts checked successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check alerts' });
    }
});

// Delete an alert
router.delete('/:id', (async (req: Request, res: Response) => {
    const index = alerts.findIndex(alert => alert.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Alert not found' });
    }
    alerts.splice(index, 1);
    res.status(204).send();
}) as RequestHandler);

// Get all alerts
router.get('/', async (req: Request, res: Response) => {
    try {
        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router; 