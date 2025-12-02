import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
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
import { PaymentsService } from './payments.service';
import { StripeService } from '../stripe/stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment.dto';
import {
  PaymentIntentResponseDto,
  PaymentResponseDto,
  PaymentListResponseDto,
} from './dto/payment-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly stripeService: StripeService,
  ) {}

  // ============================================
  // CLIENT ENDPOINTS
  // ============================================

  @Post('intent')
  @UseGuards(JwtAuthGuard)
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
    return this.paymentsService.createPaymentIntent(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
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
    return this.paymentsService.getMyPayments(req.user.id, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  // ============================================
  // WEBHOOK ENDPOINT
  // ============================================

  @Post('webhook')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
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
    return this.paymentsService.createRefund(id, req.user.id, req.user.role);
  }

  // ============================================
  // COMMON ENDPOINTS
  // ============================================

  @Get(':id')
  @UseGuards(JwtAuthGuard)
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
    return this.paymentsService.findOne(id, req.user.id, req.user.role);
  }
}
