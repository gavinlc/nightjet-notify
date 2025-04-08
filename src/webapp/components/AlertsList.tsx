import React, { useEffect, useState } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Alert, deleteAlert } from '../services/alertService';
import { format, parse } from 'date-fns';

interface AlertsListProps {
    version: number;
}

export const AlertsList: React.FC<AlertsListProps> = ({ version }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:3001/alerts');
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const data = await response.json();
            setAlerts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, [version]);

    const handleDelete = async (id: string) => {
        try {
            await deleteAlert(id);
            setAlerts(alerts.filter(alert => alert.id !== id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete alert');
        }
    };

    const formatAlertDate = (dateStr: string) => {
        try {
            // Parse the date string (DDMMYYYY format)
            const date = parse(dateStr, 'ddMMyyyy', new Date());
            return format(date, 'MMM d, yyyy');
        } catch (err) {
            return dateStr; // Fallback to original string if parsing fails
        }
    };

    if (loading) return <Typography>Loading alerts...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;
    if (alerts.length === 0) return <Typography>No alerts set up yet.</Typography>;

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
                Active Alerts
            </Typography>
            <List>
                {alerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                        <ListItem>
                            <ListItemText
                                primary={`${alert.trainNumber} - ${alert.from} to ${alert.to}`}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2">
                                            Date: {formatAlertDate(alert.date)}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2">
                                            Email: {alert.email}
                                        </Typography>
                                    </>
                                }
                            />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => alert.id && handleDelete(alert.id)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                        {index < alerts.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
}; 