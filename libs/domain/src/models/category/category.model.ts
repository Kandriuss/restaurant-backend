import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Categories & Document;

@Schema({ timestamps: true })
export class Categories {
    @Prop({ type: String, required: true, unique: true })
    id: string;

    @Prop({ type: String, required: true })
    description: string;

    @Prop({ type: String, required: true, unique: true })
    code: string;

    @Prop({ type: Boolean, default: true })
    active: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Categories);