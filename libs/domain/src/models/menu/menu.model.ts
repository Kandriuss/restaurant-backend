import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MenuDocument = Menus & Document;

@Schema({ timestamps: true })
export class Menus {
    @Prop({ type: Types.UUID, required: true })
    id: Types.UUID;

    @Prop({ type: [Types.UUID], required: true })
    plate: Types.UUID[];

    @Prop({ type: Date, required: true })
    date: Date;

    @Prop({ type: Boolean, default: true })
    isCurrent: boolean;
}

export const MenuSchema = SchemaFactory.createForClass(Menus);