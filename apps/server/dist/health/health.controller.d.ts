declare class HealthCheckResponse {
    status: string;
    timestamp: string;
    version: string;
    environment: string;
}
declare class DatabaseHealthResponse {
    status: string;
    database: string;
    responseTimeMs: number;
}
export declare class HealthController {
    check(): HealthCheckResponse;
    ready(): Promise<DatabaseHealthResponse>;
    live(): {
        status: string;
    };
}
export {};
