import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoleDocument = Roles & Document;

@Schema({ timestamps: true })
export class Roles {
  //Id UUID
  @Prop({ type: Types.UUID, required: true })
  id: Types.UUID;

  //Descripción
  @Prop({ type: String, required: true })
  description: string;

  //Rol Activo
  @Prop({ type: Boolean ,default: true })
  active: boolean;

  //Code del Rol
  @Prop({type: String, required: true, unique: true })
  code: string;
}

export const RoleSchema = SchemaFactory.createForClass(Roles);

RoleSchema.index(
  { code: 1, id: 1 },
  { unique: true, background: false }
);
