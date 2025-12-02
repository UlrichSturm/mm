"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeycloakConfig = void 0;
const createKeycloakConfig = (configService) => {
    return {
        authServerUrl: configService.get('KEYCLOAK_URL', 'http://localhost:8080'),
        realm: configService.get('KEYCLOAK_REALM', 'memento-mori'),
        clientId: configService.get('KEYCLOAK_CLIENT_ID', 'memento-mori-api'),
        secret: configService.get('KEYCLOAK_CLIENT_SECRET', ''),
        cookieKey: 'KEYCLOAK_JWT',
        bearerOnly: true,
        realmPublicKey: '',
        logLevels: ['verbose'],
    };
};
exports.createKeycloakConfig = createKeycloakConfig;
//# sourceMappingURL=keycloak.config.js.map