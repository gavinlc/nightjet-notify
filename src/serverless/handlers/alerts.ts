import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { v4 as uuidv4 } from 'uuid';
import { getTrainOffers } from '../../shared/services/api';

// Initialize AWS SDK v3 clients
const isOffline = process.env.IS_OFFLINE;

// Configure DynamoDB client based on environment
const dynamoDBClient = new DynamoDBClient({
    ...(isOffline && {
        endpoint: 'http://localhost:8000',
        region: 'local-env',
        credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
        },
    }),
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

// Configure SES client based on environment
const ses = new SESClient({
    ...(isOffline && {
        endpoint: 'http://localhost:9001',
        region: 'local-env',
        credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
        },
    }),
});

const TABLE_NAME = process.env.ALERTS_TABLE || 'nightjet-notify-alerts-dev';

// Helper function to format API response
const formatResponse = (statusCode: number, body: any): APIGatewayProxyResult => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify(body),
    };
};

// Helper function to send email using SES
const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
    if (isOffline) {
        console.log('Offline mode: Simulating email send');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('HTML:', html);
        return;
    }

    const params = {
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: html,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: process.env.SMTP_FROM || 'alerts@nightjet-notify.com',
    };

    const command = new SendEmailCommand(params);
    await ses.send(command);
};

// Create a new alert
export const createAlert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body) {
            return formatResponse(400, { error: 'Missing request body' });
        }

        const alert = JSON.parse(event.body);
        const id = uuidv4();
        const now = new Date().toISOString();

        const newAlert = {
            id,
            ...alert,
            createdAt: now,
            lastChecked: now,
        };

        await dynamoDB.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: newAlert,
        }));

        return formatResponse(201, newAlert);
    } catch (error) {
        console.error('Error creating alert:', error);
        return formatResponse(500, { error: 'Failed to create alert' });
    }
};

// Get all alerts
export const getAlerts = async (): Promise<APIGatewayProxyResult> => {
    try {
        const result = await dynamoDB.send(new ScanCommand({
            TableName: TABLE_NAME,
        }));

        return formatResponse(200, result.Items || []);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return formatResponse(500, { error: 'Failed to fetch alerts' });
    }
};

// Delete an alert
export const deleteAlert = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const id = event.pathParameters?.id;

        if (!id) {
            return formatResponse(400, { error: 'Missing alert ID' });
        }

        await dynamoDB.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id },
        }));

        return formatResponse(204, {});
    } catch (error) {
        console.error('Error deleting alert:', error);
        return formatResponse(500, { error: 'Failed to delete alert' });
    }
};

// Check all alerts for available tickets
export const checkAlerts = async (): Promise<APIGatewayProxyResult> => {
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        // Get all alerts
        const result = await dynamoDB.send(new ScanCommand({
            TableName: TABLE_NAME,
        }));
        const alerts = result.Items || [];

        // Filter alerts that haven't been checked in the last hour
        const alertsToCheck = alerts.filter(alert => {
            const lastChecked = new Date(alert.lastChecked);
            return lastChecked < oneHourAgo;
        });

        console.log(`Checking ${alertsToCheck.length} alerts for available tickets`);

        for (const alert of alertsToCheck) {
            try {
                // Convert date string to timestamp (assuming date is in DDMMYYYY format)
                const [day, month, year] = alert.date.match(/(\d{2})(\d{2})(\d{4})/)?.slice(1) || [];
                const timestamp = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();

                const offer = await getTrainOffers(alert.trainNumber, alert.from, alert.to, timestamp);

                if (offer && (offer.bestOffers.be || offer.bestOffers.le || offer.bestOffers.se)) {
                    // Send email notification using SES
                    await sendEmail(
                        alert.email,
                        'NightJet Tickets Available!',
                        `
                            <h1>NightJet Tickets Available!</h1>
                            <p>Good news! Tickets are now available for your selected train:</p>
                            <ul>
                                <li>Train: ${alert.trainNumber}</li>
                                <li>Date: ${alert.date}</li>
                                <li>From: ${alert.from}</li>
                                <li>To: ${alert.to}</li>
                            </ul>
                            <p>Click <a href="${process.env.FRONTEND_URL}">here</a> to book your tickets!</p>
                        `
                    );
                }

                // Update last checked time
                await dynamoDB.send(new UpdateCommand({
                    TableName: TABLE_NAME,
                    Key: { id: alert.id },
                    UpdateExpression: 'SET lastChecked = :now',
                    ExpressionAttributeValues: {
                        ':now': now.toISOString(),
                    },
                }));
            } catch (error) {
                console.error(`Error checking alert ${alert.id}:`, error);
                // Continue with other alerts even if one fails
            }
        }

        return formatResponse(200, { message: 'Alerts checked successfully' });
    } catch (error) {
        console.error('Error checking alerts:', error);
        return formatResponse(500, { error: 'Failed to check alerts' });
    }
}; 