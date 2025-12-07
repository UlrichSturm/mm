import { ConfigService } from '@nestjs/config';
import { KeycloakConnectOptions, PolicyEnforcementMode, TokenValidation } from 'nest-keycloak-connect';

export const createKeycloakConfig = (
  configService: ConfigService,
): KeycloakConnectOptions => {
  return {
    authServerUrl: 'http://localhost:8080', // Must match token issuer
    realm: configService.get<string>('KEYCLOAK_REALM', 'memento-mori'),
    // clientId: configService.get<string>('KEYCLOAK_CLIENT_ID', 'memento-mori-api'),
    secret: configService.get<string>('KEYCLOAK_CLIENT_SECRET', ''),

    // Cookie settings
    cookieKey: 'KEYCLOAK_JWT',

    // Token validation
    tokenValidation: TokenValidation.OFFLINE,
    verifyTokenAudience: false, // Disable audience check for simplicity in dev

    // CORS
    realmPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzil2bNyaDBDt1I/+fKz9c/gIaCMc5CHi9h+dnUs98hosnsov5dy8I4UWZFHDAem24s7qJCblil96+4zyAwVaUSB58JtZXjawq2p0280lqERETYut9sSMVHWlYMnNwGFEV6dZnHxSimw1M3I9sMOTnTaHzhk6IbjI+yHsh+ePYH+F3tvXNVDQITDFVyZwe/A80zN5kNF9dvFhoihZWoQgj168ItxKw+At6o2mIAVWUMbY1IRBdd6fJPrVqPTTIvC3j3SGwoOQDPtcNHtSYvx91N3y6PF7yhtROlo/edDxRS2jTIcnfS4JDLvuLsm3w4HN8iex+oXNvjEm+KLniFbi8wIDAQAB',

    // Policy Enforcement
    policyEnforcement: PolicyEnforcementMode.PERMISSIVE,

    // Logging
    logLevels: ['verbose'],
  };
};

