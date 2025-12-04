"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKeycloakConfig = void 0;
const nest_keycloak_connect_1 = require("nest-keycloak-connect");
const createKeycloakConfig = (configService) => {
    return {
        authServerUrl: 'http://localhost:8080',
        realm: configService.get('KEYCLOAK_REALM', 'memento-mori'),
        secret: configService.get('KEYCLOAK_CLIENT_SECRET', ''),
        cookieKey: 'KEYCLOAK_JWT',
        tokenValidation: nest_keycloak_connect_1.TokenValidation.OFFLINE,
        verifyTokenAudience: false,
        realmPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzil2bNyaDBDt1I/+fKz9c/gIaCMc5CHi9h+dnUs98hosnsov5dy8I4UWZFHDAem24s7qJCblil96+4zyAwVaUSB58JtZXjawq2p0280lqERETYut9sSMVHWlYMnNwGFEV6dZnHxSimw1M3I9sMOTnTaHzhk6IbjI+yHsh+ePYH+F3tvXNVDQITDFVyZwe/A80zN5kNF9dvFhoihZWoQgj168ItxKw+At6o2mIAVWUMbY1IRBdd6fJPrVqPTTIvC3j3SGwoOQDPtcNHtSYvx91N3y6PF7yhtROlo/edDxRS2jTIcnfS4JDLvuLsm3w4HN8iex+oXNvjEm+KLniFbi8wIDAQAB',
        policyEnforcement: nest_keycloak_connect_1.PolicyEnforcementMode.PERMISSIVE,
        logLevels: ['verbose'],
    };
};
exports.createKeycloakConfig = createKeycloakConfig;
//# sourceMappingURL=keycloak.config.js.map