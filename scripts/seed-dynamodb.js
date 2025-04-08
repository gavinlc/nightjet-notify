import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DynamoDB client for local development
const dynamoDBClient = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'local-env',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);
const TABLE_NAME = 'nightjet-notify-alerts-dev';

// Read seed data from JSON file
const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../seeds/alerts.json'), 'utf8')
);

// Function to seed the DynamoDB table
async function seedDynamoDB() {
  console.log(`Seeding DynamoDB table: ${TABLE_NAME}`);
  
  for (const item of seedData) {
    try {
      await dynamoDB.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: item,
        })
      );
      console.log(`Added item with ID: ${item.id}`);
    } catch (error) {
      console.error(`Error adding item with ID ${item.id}:`, error);
    }
  }
  
  console.log('Seeding completed!');
}

// Run the seeding function
seedDynamoDB().catch((error) => {
  console.error('Error seeding DynamoDB:', error);
  process.exit(1);
}); 