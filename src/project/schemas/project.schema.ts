import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class ProjectDetail {
  @Prop()
  name?: string;

  @Prop()
  description?: string;

  @Prop({
    type: {
      github: { type: String },
      website: { type: String },
      twitter: { type: String },
      telegram: { type: String },
      NEAR: { type: String },
    },
  })
  linktree: {
    github?: string;
    website?: string;
    twitter?: string;
    telegram?: string;
    NEAR?: string;
  };

  @Prop({ type: { ipfs_cid: { type: String }, url: { type: String } } })
  image: {
    ipfs_cid?: string;
    url?: string;
  };

  @Prop({ type: { ipfs_cid: { type: String }, url: { type: String } } })
  backgroundImage: {
    ipfs_cid?: string;
    url?: string;
  };

  @Prop({ type: Object })
  tags?: {};

  @Prop({ type: { text: { type: String }, value: { type: String } } })
  category: {
    text?: string;
    value?: string;
  };

  @Prop({ type: Array })
  team?: [];

  @Prop()
  latest_update?: number;
}

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

  @Prop({ type: ProjectDetail })
  details: ProjectDetail;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
