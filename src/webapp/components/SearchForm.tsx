import React, { useState } from 'react';
import { Box, TextField, Button, Autocomplete, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Station, searchStations } from '@shared/services/api';

interface SearchFormProps {
    onSearch: (fromStation: Station, toStation: Station, date: Date) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    const [fromStation, setFromStation] = useState<Station | null>(null);
    const [toStation, setToStation] = useState<Station | null>(null);
    const [date, setDate] = useState<Date | null>(new Date());
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(false);

    const handleStationSearch = async (query: string) => {
        if (query.length < 2) return;
        setLoading(true);
        try {
            const results = await searchStations(query);
            setStations(results);
        } catch (error) {
            console.error('Error searching stations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (fromStation && toStation && date) {
            onSearch(fromStation, toStation, date);
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2 }}>
                <Autocomplete
                    options={stations}
                    getOptionLabel={(option) => `${option.name} (${option.meta})`}
                    value={fromStation}
                    onChange={(_, newValue) => setFromStation(newValue)}
                    onInputChange={(_, newInputValue) => handleStationSearch(newInputValue)}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="From"
                            required
                            fullWidth
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                <Autocomplete
                    options={stations}
                    getOptionLabel={(option) => `${option.name} (${option.meta})`}
                    value={toStation}
                    onChange={(_, newValue) => setToStation(newValue)}
                    onInputChange={(_, newInputValue) => handleStationSearch(newInputValue)}
                    loading={loading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="To"
                            required
                            fullWidth
                        />
                    )}
                    sx={{ flex: 1 }}
                />
                <DatePicker
                    label="Date"
                    value={date}
                    onChange={(newValue) => setDate(newValue)}
                    slotProps={{ textField: { required: true } }}
                    sx={{ flex: 1 }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!fromStation || !toStation || !date}
                >
                    Search
                </Button>
            </Box>
        </Paper>
    );
}; 