import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { Roles, Resource, Public, Unprotected } from 'nest-keycloak-connect';
import { PaymentsService } from './payments.service';
import { Role } from '../common/enums/role.enum';
import { StripeService } from '../stripe/stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import {
  PaymentIntentResponseDto,
  PaymentResponseDto,
  PaymentListResponseDto,
} from './dto/payment-response.dto';

@ApiTags('payments')
@Controller('payments')
@Resource('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  // ============================================
  // CLIENT ENDPOINTS
  // ============================================

  @Post('intent')
  @Roles({ roles: ['client'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create payment intent for an order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment intent created successfully',
    type: PaymentIntentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid order or already paid' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async createPaymentIntent(
    @Request() req: any,
    @Body() dto: CreatePaymentIntentDto,
  ): Promise<PaymentIntentResponseDto> {
    return this.paymentsService.createPaymentIntent(req.user.sub, dto);
  }

  @Get('my')
  @Roles({ roles: ['client'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current client payments' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of client payments',
    type: PaymentListResponseDto,
  })
  async getMyPayments(
    @Request() req: any,
    @Query('status') status?: PaymentStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaymentListResponseDto> {
    return this.paymentsService.getMyPayments(req.user.sub, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  // ============================================
  // WEBHOOK ENDPOINT
  // ============================================

  @Post('webhook')
  @Public()
  @Unprotected()
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint() // Hide from Swagger - internal use only
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      return { received: false, error: 'No raw body' };
    }

    try {
      const event = this.stripeService.constructWebhookEvent(rawBody, signature);
      await this.paymentsService.handleWebhook(event);
      return { received: true };
    } catch (error) {
      return { received: false, error: (error as Error).message };
    }
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get()
  @Roles({ roles: ['admin'] })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payments (admin only)' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'clientId', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false, example: 1 })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all payments',
    type: PaymentListResponseDto,
  })
  async findAll(
    @Query('status') status?: PaymentStatus,
    @Query('clientId') clientId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaymentListResponseDto> {
    return this.paymentsService.findAll({
      status,
      clientId,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Post(':id/refund')
  @Roles({ roles: ['admin'] })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate refund for a payment (admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Refund initiated',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot refund this payment' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  async createRefund(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.paymentsService.createRefund(id, req.user.sub, userRole);
  }

  // ============================================
  // COMMON ENDPOINTS
  // ============================================

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized' })
  async findOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentResponseDto> {
    const userRole = this.getRoleFromKeycloakRoles(req.user.roles);
    return this.paymentsService.findOne(id, req.user.sub, userRole);
  }

  /**
   * Helper to convert Keycloak roles to our Role enum
   */
  private getRoleFromKeycloakRoles(roles: string[]): Role {
    if (roles?.includes('admin')) {return Role.ADMIN;}
    if (roles?.includes('vendor')) {return Role.VENDOR;}
    if (roles?.includes('lawyer_notary')) {return Role.LAWYER_NOTARY;}
    return Role.CLIENT;
  }
}
