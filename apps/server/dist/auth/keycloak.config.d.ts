import { KeycloakConnectOptions } from 'nest-keycloak-connect';
import { ConfigService } from '@nestjs/config';
export declare const createKeycloakConfig: (configService: ConfigService) => KeycloakConnectOptions;
