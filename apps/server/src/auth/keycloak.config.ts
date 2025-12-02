import { KeycloakConnectOptions } from 'nest-keycloak-connect';
import { ConfigService } from '@nestjs/config';

export const createKeycloakConfig = (
  configService: ConfigService,
): KeycloakConnectOptions => {
  return {
    authServerUrl: configService.get<string>('KEYCLOAK_URL', 'http://localhost:8080'),
    realm: configService.get<string>('KEYCLOAK_REALM', 'memento-mori'),
    clientId: configService.get<string>('KEYCLOAK_CLIENT_ID', 'memento-mori-api'),
    secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET', ''),
    
    // Cookie settings
    cookieKey: 'KEYCLOAK_JWT',
    
    // Token validation
    bearerOnly: true, // API mode - no redirects, just validate tokens
    
    // CORS
    realmPublicKey: '', // Will be fetched automatically
    
    // Logging
    logLevels: ['verbose'],
  };
};

