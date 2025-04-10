import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
} from '@mui/material';
import { Connection } from '@shared/services/api';
import { createAlert } from '../services/alertService';
import { format } from 'date-fns';

interface AlertSignupProps {
    open: boolean;
    onClose: () => void;
    connection: Connection;
    fromStation: string;
    toStation: string;
    onAlertCreated: () => void;
}

export const AlertSignup: React.FC<AlertSignupProps> = ({
    open,
    onClose,
    connection,
    fromStation,
    toStation,
    onAlertCreated,
}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await createAlert({
                email,
                trainNumber: connection.trains[0].train,
                from: fromStation,
                to: toStation,
                date: format(new Date(connection.trains[0].departure.utc), 'ddMMyyyy'),
            });

            setSuccess(true);
            setEmail('');
            onAlertCreated();
            setTimeout(onClose, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create alert');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Set Up Price Alert</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">
                        We'll notify you when tickets become available for:
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        {connection.trains[0].train} from {fromStation} to {toStation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Departure: {new Date(connection.trains[0].departure.utc).toLocaleString()}
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading || success}
                    />
                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                    {success && (
                        <Typography color="success.main" sx={{ mt: 1 }}>
                            Alert created successfully! You'll receive an email when tickets become available.
                        </Typography>
                    )}
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading || success || !email}
                >
                    {loading ? 'Creating Alert...' : 'Create Alert'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}; 