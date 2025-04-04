import axios from 'axios';

const API_BASE_URL = '/api';

export interface Station {
    number: number;
    meta: string;
    name: string;
    latitude: number;
    longitude: number;
}

export interface Connection {
    trains: TrainConnection[];
    from: {
        number: string;
        name: string;
    };
    to: {
        number: string;
        name: string;
    };
}

export interface TrainConnection {
    train: string;
    arrival: {
        utc: number;
        local: string
    };
    departure: {
        utc: number;
        local: string;
    };
    seatAsIc: boolean;
    trainType: string;
}


export interface Ticket {
    name: string;
    price: number;
}

export interface TrainOffer {
    departure: string;
    arrival: string;
    bestOffers: {
        be?: Ticket;
        le?: Ticket;
        se?: Ticket;
    };
}

export const searchStations = async (query: string): Promise<Station[]> => {
    const response = await axios.get(`${API_BASE_URL}/stations/find`, {
        params: {
            name: query,
            lang: 'en',
            t: Date.now()
        }
    });
    return response.data;
};

export const searchConnections = async (from: string, to: string, date: string): Promise<Connection[]> => {
    const response = await axios.get(`${API_BASE_URL}/connection/${from}/${to}/${date}`);
    return response.data.connections;
};

export const getTrainOffers = async (trainName: string, from: string, to: string, timestamp: number): Promise<TrainOffer> => {
    const response = await axios.get(`${API_BASE_URL}/destinations/offers/${trainName}/${from}/${to}/${timestamp}`);
    return response.data[0];
};

export default axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Referer': 'https://www.nightjet.com/'
    }
}); 