import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import { AlertsList } from './components/AlertsList';
import { Station, Connection, TrainOffer, searchConnections, getTrainOffers } from '@shared/services/api';
import { format } from 'date-fns';

const App: React.FC = () => {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [offers, setOffers] = useState<Record<string, TrainOffer>>({});
    const [loading, setLoading] = useState(false);
    const [alertsVersion, setAlertsVersion] = useState(0);

    const handleSearch = async (fromStation: Station, toStation: Station, date: Date) => {
        setLoading(true);
        try {
            // Format date as DDMMYYYY
            const formattedDate = format(date, 'yyyy-MM-dd');
            // Search for connections
            const results = await searchConnections(
                fromStation.number.toString(),
                toStation.number.toString(),
                formattedDate
            );
            setConnections(results);

            // Get offers for each connection
            const offersMap: Record<string, TrainOffer> = {};

            // Create an array of promises for all offers
            const offerPromises = results.flatMap(connection =>
                connection.trains.map(async trainConnection => {
                    try {
                        const offer = await getTrainOffers(
                            trainConnection.train,
                            fromStation.number.toString(),
                            toStation.number.toString(),
                            trainConnection.departure.utc
                        );
                        const key = `${trainConnection.train}_${trainConnection.departure.utc}`;
                        offersMap[key] = offer;
                    } catch (error) {
                        console.error(`Error fetching offers for ${trainConnection.train}:`, error);
                    }
                })
            );

            // Wait for all offers to be fetched
            await Promise.all(offerPromises);
            setOffers(offersMap);
        } catch (error) {
            console.error('Error searching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAlertCreated = () => {
        setAlertsVersion(prev => prev + 1);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    {/* <pre>connections: {JSON.stringify(connections, null, 2)}</pre>
                    <pre>offers: {JSON.stringify(offers, null, 2)}</pre> */}
                    <Typography variant="h3" component="h1" gutterBottom align="center">
                        NightJet Notify
                    </Typography>
                    <SearchForm onSearch={handleSearch} />
                    <ResultsList
                        connections={connections}
                        offers={offers}
                        loading={loading}
                        onAlertCreated={handleAlertCreated}
                    />
                    <AlertsList version={alertsVersion} />
                </Box>
            </Container>
        </LocalizationProvider>
    );
};

export default App; 