import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class DebugRoleGuard implements CanActivate {
  private readonly logger = new Logger(DebugRoleGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesMeta = this.reflector.get('roles', context.getHandler()) as any;

    if (!rolesMeta || !rolesMeta.roles) {
      this.logger.warn('DebugRoleGuard: No roles required for this handler');
      return true;
    }

    const roles = rolesMeta.roles;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.warn(`DebugRoleGuard: Required Roles: ${JSON.stringify(roles)}`);
    this.logger.warn(
      `DebugRoleGuard: User Roles (from request.user.roles): ${JSON.stringify(user?.roles)}`,
    );
    this.logger.warn(`DebugRoleGuard: User Realm Access: ${JSON.stringify(user?.realm_access)}`);
    this.logger.warn(
      `DebugRoleGuard: User Resource Access: ${JSON.stringify(user?.resource_access)}`,
    );

    if (!user || !user.realm_access || !user.realm_access.roles) {
      this.logger.warn('DebugRoleGuard: User has no realm_access.roles');
      return false;
    }

    const userRoles = user.realm_access.roles;
    const hasRole = roles.some(role => userRoles.includes(role));

    this.logger.warn(`DebugRoleGuard: Match Result: ${hasRole}`);
    return hasRole;
  }
}
