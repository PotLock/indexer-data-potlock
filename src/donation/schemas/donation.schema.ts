import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: true, collection: 'donations' })
export class Donation {
  @Prop({ required: true })
  donate_id: number;

  @Prop()
  donor_id?: string;

  @Prop()
  total_amount?: string;

  @Prop()
  ft_id?: string;

  @Prop()
  message?: string;

  @Prop()
  donated_at_ms?: number;

  @Prop()
  recipient_id?: string;

  @Prop()
  protocol_fee?: string;

  @Prop()
  referrer_id?: string;

  @Prop()
  referrer_fee?: string;

  @Prop()
  dateCreated?: Date;

  @Prop()
  dateUpdated?: Date;
}

export const DonationSchema = SchemaFactory.createForClass(Donation);
