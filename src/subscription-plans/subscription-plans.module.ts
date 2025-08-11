// src/subscription-plans/subscription-plans.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionPlansService } from './subscription-plans.service';
import { SubscriptionPlansController } from './subscription-plans.controller';
import { SubscriptionPlan, SubscriptionPlanSchema } from './schemas/subscription-plan.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: SubscriptionPlan.name, schema: SubscriptionPlanSchema }
        ])
    ],
    controllers: [SubscriptionPlansController],
    providers: [SubscriptionPlansService],
    exports: [SubscriptionPlansService],
})
export class SubscriptionPlansModule { }