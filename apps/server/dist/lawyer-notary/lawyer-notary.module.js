"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyerNotaryModule = void 0;
const common_1 = require("@nestjs/common");
const lawyer_notary_controller_1 = require("./lawyer-notary.controller");
const lawyer_notary_service_1 = require("./lawyer-notary.service");
const auth_module_1 = require("../auth/auth.module");
let LawyerNotaryModule = class LawyerNotaryModule {
};
exports.LawyerNotaryModule = LawyerNotaryModule;
exports.LawyerNotaryModule = LawyerNotaryModule = __decorate([
    (0, common_1.Module)({
        imports: [(0, common_1.forwardRef)(() => auth_module_1.AuthModule)],
        controllers: [lawyer_notary_controller_1.LawyerNotaryController],
        providers: [lawyer_notary_service_1.LawyerNotaryService],
        exports: [lawyer_notary_service_1.LawyerNotaryService],
    })
], LawyerNotaryModule);
//# sourceMappingURL=lawyer-notary.module.js.map