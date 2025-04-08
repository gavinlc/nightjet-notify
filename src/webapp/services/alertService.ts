import axios from 'axios';

export interface Alert {
    id?: string;
    email: string;
    trainNumber: string;
    from: string;
    to: string;
    date: string;
    createdAt?: Date;
    lastChecked?: Date;
}

const API_URL = 'http://localhost:3001/alerts';

export async function createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'lastChecked'>): Promise<Alert> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
    });

    if (!response.ok) {
        throw new Error('Failed to create alert');
    }

    return response.json();
}

export const checkAlerts = async (): Promise<Alert[]> => {
    const response = await axios.get('http://localhost:3001/alerts/check');
    return response.data;
};

export async function deleteAlert(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Failed to delete alert');
    }
} 