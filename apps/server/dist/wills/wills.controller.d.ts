export declare class WillsController {
    getAllAppointments(_filters: Record<string, unknown>): Promise<any[]>;
    getAppointment(_id: string): Promise<any>;
    getAllExecutions(_filters: Record<string, unknown>): Promise<any[]>;
    getExecution(_id: string): Promise<any>;
    getWillData(_id: string): Promise<any>;
}
