import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class HealthController {
    private readonly configService;
    private readonly prisma;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService);
    getHealth(): {
        status: string;
        version: string;
        env: string;
    };
    getReadiness(): Promise<{
        database: string;
    }>;
    getLiveness(): {
        status: string;
    };
}
