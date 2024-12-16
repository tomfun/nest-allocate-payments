import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import Big from 'big.js';
import { AdminConfigService } from './admin-config.service';
import { SystemFeesDto } from './system-fees.dto';
import { ShopService } from './shop.service';
import { AddShopDto } from './add-shop.dto';
import { PaymentService } from './payment.service';

@Controller('api/admin')
export class AppController {
  constructor(
    private readonly configService: AdminConfigService,
    private readonly shopService: ShopService,
    private readonly paymentService: PaymentService,
  ) {}

  @Get('fees')
  getFees(): SystemFeesDto {
    return this.configService.getFees();
  }

  @Patch('fees')
  setShopFees(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    fees: SystemFeesDto,
  ): SystemFeesDto {
    return this.configService.setFees(fees).getFees();
  }

  // Debug endpoint
  @Get('shop/:shopId')
  getShop(@Param('shopId') shopId: string) {
    const shop = this.shopService.getShop(shopId);
    if (!shop) {
      throw new NotFoundException();
    }
    return {
      ...shop,
      payments: this.paymentService.getPayments(shop.id),
    };
  }

  @Post('shop')
  addShop(
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    shopDto: AddShopDto,
  ) {
    return this.shopService.addShop(shopDto).id;
  }

  @Post('shop/:shopId/payout')
  conductPayout(@Param('shopId') shopId: string): {
    totalPayout: string;
    payments: { id: string; amountPaidOut: string }[];
  } {
    const shop = this.shopService.getShop(shopId);
    if (!shop) {
      throw new NotFoundException();
    }
    const payments = this.paymentService.payoutPayments(shopId);
    return {
      totalPayout: payments
        .reduce((sum, payment) => sum.add(payment.amountPaidOut), Big(0))
        .toString(),
      payments,
    };
  }
}
