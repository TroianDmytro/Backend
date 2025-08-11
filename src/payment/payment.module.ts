//src/payment/payment.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MonobankService } from './monobank.service';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Subscription, SubscriptionSchema } from '../subscriptions/schemas/subscription.schema';
import { EmailModule } from '../email/email.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Payment.name, schema: PaymentSchema },
            { name: Subscription.name, schema: SubscriptionSchema }
        ]),
        HttpModule,
        EmailModule,
        forwardRef(() => SubscriptionsModule),
    ],
    controllers: [PaymentController],
    providers: [PaymentService, MonobankService],
    exports: [PaymentService, MonobankService],
})
export class PaymentModule {}

