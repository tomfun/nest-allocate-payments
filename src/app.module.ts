import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ShopService } from './shop.service';
import { PaymentController } from './payment.controller';
import { AdminConfigService } from './admin-config.service';
import { PaymentService } from './payment.service';
import { MaximizePayoutService } from './maximize-payout.service';

@Module({
  imports: [],
  controllers: [AppController, PaymentController],
  providers: [
    AdminConfigService,
    MaximizePayoutService,
    PaymentService,
    ShopService,
  ],
})
export class AppModule {}
