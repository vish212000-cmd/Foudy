export interface BlockedUser {
    id: number;
    username: string;
    created_at: string;
}

export interface ReportPayload {
    reason: string;
    details?: string;
}
