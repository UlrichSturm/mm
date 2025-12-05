import { ConfigService } from '@nestjs/config';
import { KeycloakConnectOptions, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

export const createKeycloakConfig = (
  configService: ConfigService,
): KeycloakConnectOptions => {
  // Get Keycloak URL
  // IMPORTANT: authServerUrl must match the issuer in tokens exactly
  // Tokens have issuer: http://localhost:8080/realms/memento-mori
  // So authServerUrl should be: http://localhost:8080 (not host.docker.internal)
  const keycloakUrl = configService.get<string>('KEYCLOAK_URL', 'http://localhost:8080');

  // Normalize URL: replace host.docker.internal with localhost for issuer matching
  // This is needed because tokens are issued with localhost:8080 as issuer
  const normalizedUrl = keycloakUrl.replace('host.docker.internal', 'localhost');

  return {
    authServerUrl: normalizedUrl, // Must be http://localhost:8080 to match token issuer
    realm: configService.get<string>('KEYCLOAK_REALM', 'memento-mori'),
    // clientId: configService.get<string>('KEYCLOAK_CLIENT_ID', 'memento-mori-api'),
    secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET', ''),

    // Cookie settings
    cookieKey: 'KEYCLOAK_JWT',

    // Token validation
    // Try ONLINE validation to fetch public key from Keycloak automatically
    tokenValidation: TokenValidation.ONLINE,
    verifyTokenAudience: false, // Disable audience check for simplicity in dev

    // Allow different issuer (for Docker/localhost mismatch)
    // In development, tokens from localhost:8080 can be validated even if authServerUrl is host.docker.internal:8080
    // The library will handle this automatically with OFFLINE validation

    // CORS - Public key for token validation (OFFLINE mode)
    // Get from env or fetch from Keycloak
    realmPublicKey: configService.get<string>('KEYCLOAK_REALM_PUBLIC_KEY'),

    // Policy Enforcement
    policyEnforcement: PolicyEnforcementMode.PERMISSIVE,

    // Logging
    logLevels: ['verbose'],
  };
};

