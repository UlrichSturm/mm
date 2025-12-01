import { Injectable, ExecutionContext, UnauthorizedException, Inject, forwardRef, CanActivate } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';

/**
 * JWT Authentication Guard
 * 
 * Validates JWT token and sets user in request for use by RolesGuard
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    
    // Validate token and get user
    const user = await this.authService.validateToken(token);
    
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    // Set user in request for RolesGuard
    request.user = user;
    
    return true;
  }
}

