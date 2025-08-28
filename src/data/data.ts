export interface UserData5Min {
    count: number,
    timestamp: number
}

export interface ResponseMessage {
    code: string;
    message?: string;
    data?: any;
    error?: any
}

export interface ZoneConfig {
    id: string | null;
    configName: string | null;
    eventId: string | null;
    zoneId: string | null;
    name: string | null;
    price: number | null;
    discount: number | null;
    available: boolean | null;
    maxTicket: number | null;
    remainingTicket: number | null;
    soldTicket: number | null;
    eventDate: string | null;
    eventDateString: string | null;
    eventIdDoc: string | null;
    image: string | null;
    labelColor: string | null;
    labelPosition: "left" | "right" | "top" | "bottom" | null;
    concertTicket: number | null;
}
