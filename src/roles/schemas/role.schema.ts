import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema()
export class Role {
    // Явно определяем _id
    _id?: Types.ObjectId;

    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);