import { Schema, model } from 'mongoose';

const imageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    mimeType: { type: String, required: true },
    filename: { type: String, trim: true },
    size: { type: Number, required: true },
  },
  { timestamps: true }
);

const Image = model('Image', imageSchema);

export default Image;