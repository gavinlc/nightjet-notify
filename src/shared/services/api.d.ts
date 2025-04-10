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
        local: string;
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
export declare const searchStations: (query: string) => Promise<Station[]>;
export declare const searchConnections: (from: string, to: string, date: string) => Promise<Connection[]>;
export declare const getTrainOffers: (trainName: string, from: string, to: string, timestamp: number) => Promise<TrainOffer>;
declare const _default: import("axios").AxiosInstance;
export default _default;
