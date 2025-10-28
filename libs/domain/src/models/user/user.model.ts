import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = Users & Document;
@Schema({ timestamps: true })
export class Users {

  @Prop({ type: String, required: true, unique: true })
  id: string;
  
  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, required: true, trim: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true, match: /^\+56[0-9]{9}$/ })
  phone: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, required: false })
  roleCode?: string;

  @Prop({ type: String, required: true, match: /^[0-9]+-[0-9kK]{1}$/, unique: true })
  rut: string
}

export const UserSchema = SchemaFactory.createForClass(Users);

// Agregar el campo id al esquema
UserSchema.add({
  id: { type: String, required: true, unique: true }
});
