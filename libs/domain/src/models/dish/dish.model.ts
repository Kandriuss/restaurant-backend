import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DishDocument = Dishes & Document;

@Schema({ timestamps: true })
export class Dishes {
    //Id UUID
    @Prop({ type: String, required: true, unique: true })
    id: string;

    //Nombre del plato
    @Prop({ type: String, required: true })
    name: string;

    //Descripción del plato
    @Prop({ type: String, required: true })
    description: string;

    //Precio del plato
    @Prop({ type: Number, required: true })
    price: number;

    //Imagen del plato
    @Prop({ type: String, required: true })
    image: string;

    //Plato activo
    @Prop({ type: Boolean, default: true })
    active: boolean;
}

export const DishSchema = SchemaFactory.createForClass(Dishes);

DishSchema.index(
    { name: 1, id: 1 },
    { unique: true, background: false }
);