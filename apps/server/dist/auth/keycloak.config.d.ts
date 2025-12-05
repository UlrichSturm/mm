import { ConfigService } from '@nestjs/config';
import { KeycloakConnectOptions } from 'nest-keycloak-connect';
export declare const createKeycloakConfig: (configService: ConfigService) => KeycloakConnectOptions;
