"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeycloakConfig = void 0;
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const createKeycloakConfig = (configService) => {
    const keycloakUrl = configService.get('KEYCLOAK_URL', 'http://localhost:8080');
    const normalizedUrl = keycloakUrl.replace('host.docker.internal', 'localhost');
    return {
        authServerUrl: normalizedUrl,
        realm: configService.get('KEYCLOAK_REALM', 'memento-mori'),
        secret: configService.get('KEYCLOAK_CLIENT_SECRET', ''),
        cookieKey: 'KEYCLOAK_JWT',
        tokenValidation: nest_keycloak_connect_1.TokenValidation.ONLINE,
        verifyTokenAudience: false,
        realmPublicKey: configService.get('KEYCLOAK_REALM_PUBLIC_KEY'),
        policyEnforcement: nest_keycloak_connect_1.PolicyEnforcementMode.PERMISSIVE,
        logLevels: ['verbose'],
    };
};
exports.createKeycloakConfig = createKeycloakConfig;
//# sourceMappingURL=keycloak.config.js.map