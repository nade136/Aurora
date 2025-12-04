export type MediaType = 'image' | 'video';

export interface TestimonialMedia {
  type: MediaType;
  url: string;
  thumbnail?: string;
}

export interface TestimonialData {
  name: string;
  media: TestimonialMedia;
  size: 'tall' | 'regular';
  role?: string;
  company?: string;
  quote?: string;
}

export interface TestimonialBlock {
  id: string;
  order: number;
  type: 'testimonial';
  data: TestimonialData;
  section_id: string;
  created_at: string;
  updated_at: string;
}
