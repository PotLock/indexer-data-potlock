import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: true, collection: 'projects' })
export class Project {
  @Prop({ required: true })
  project_id: string;

  @Prop()
  status: string;

  @Prop()
  submitted_ms: number;

  @Prop()
  updated_ms: number;

  @Prop()
  review_notes?: string;

  @Prop()
  dateCreated?: Date;

  @Prop()
  dateUpdated?: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
