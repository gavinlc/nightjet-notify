import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
    Box,
    Button,
} from '@mui/material';
import { Connection, TrainOffer } from '../services/api';
import { format } from 'date-fns';
import { AlertSignup } from './AlertSignup';

interface ResultsListProps {
    connections: Connection[];
    offers: Record<string, TrainOffer>;
    loading: boolean;
    onAlertCreated: () => void;
}

export const ResultsList: React.FC<ResultsListProps> = ({
    connections,
    offers,
    loading,
    onAlertCreated,
}) => {
    const [alertDialogOpen, setAlertDialogOpen] = useState(false);
    const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
    const [selectedFromStation, setSelectedFromStation] = useState('');
    const [selectedToStation, setSelectedToStation] = useState('');

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (connections.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No connections found</Typography>
            </Paper>
        );
    }

    const handleAlertClick = (connection: Connection, fromStation: string, toStation: string) => {
        setSelectedConnection(connection);
        setSelectedFromStation(fromStation);
        setSelectedToStation(toStation);
        setAlertDialogOpen(true);
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Train</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>From</TableCell>
                            <TableCell>To</TableCell>
                            <TableCell>Sleeping Car</TableCell>
                            <TableCell>Couchette</TableCell>
                            <TableCell>Seat</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {connections.flatMap((connection) =>
                            connection.trains.map((trainConnection) => {
                                const offer = offers[trainConnection.train + '_' + trainConnection.departure.utc];
                                // Format the date from the departure UTC timestamp
                                const departureDate = new Date(trainConnection.departure.utc);
                                const formattedDate = format(departureDate, 'MMM d, yyyy');

                                // Format departure and arrival times
                                const formattedDeparture = offer?.departure ? format(new Date(offer.departure), 'MMM d, HH:mm') : '';
                                const formattedArrival = offer?.arrival ? format(new Date(offer.arrival), 'MMM d, HH:mm') : '';

                                // Check if any offers are available
                                const hasOffers = offer?.bestOffers.be || offer?.bestOffers.le || offer?.bestOffers.se;

                                return (
                                    <TableRow key={trainConnection.train + '_' + trainConnection.departure.utc}>
                                        <TableCell>{trainConnection.train}</TableCell>
                                        <TableCell>{formattedDate}</TableCell>
                                        <TableCell>
                                            {connection.from.name} ({formattedDeparture})
                                        </TableCell>
                                        <TableCell>
                                            {connection.to.name} ({formattedArrival})
                                        </TableCell>
                                        {hasOffers ? (
                                            <>
                                                <TableCell>
                                                    {offer?.bestOffers.be
                                                        ? `€${offer.bestOffers.be.price}`
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {offer?.bestOffers.le
                                                        ? `€${offer.bestOffers.le.price}`
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {offer?.bestOffers.se
                                                        ? `€${offer.bestOffers.se.price}`
                                                        : 'N/A'}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell colSpan={3} align="center">
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                                        <Typography>No offers available</Typography>
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            onClick={() => handleAlertClick(connection, connection.from.name, connection.to.name)}
                                                        >
                                                            Set up price alert
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {selectedConnection && (
                <AlertSignup
                    open={alertDialogOpen}
                    onClose={() => setAlertDialogOpen(false)}
                    connection={selectedConnection}
                    fromStation={selectedFromStation}
                    toStation={selectedToStation}
                    onAlertCreated={onAlertCreated}
                />
            )}
        </>
    );
}; 