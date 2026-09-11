import { Schema, model, type HydratedDocument, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true },
);

export type UserDocument = HydratedDocument<
  InferSchemaType<typeof userSchema> & { createdAt: Date; updatedAt: Date }
>;

export const UserModel = model('User', userSchema);
