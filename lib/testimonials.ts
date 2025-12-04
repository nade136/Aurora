import { createClient } from "@supabase/supabase-js";
import { TestimonialData, TestimonialMedia } from "@/types/testimonial";

// Initialize the client with your Supabase URL and anon key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function uploadMedia(file: File): Promise<{ url: string; error: Error | null }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `testimonials/${fileName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('testimonials')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('testimonials')
      .getPublicUrl(filePath);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading media:', error);
    return { url: '', error: error as Error };
  }
}

export async function createTestimonial(sectionId: string, data: Partial<TestimonialData>) {
  const defaultData: TestimonialData = {
    name: '',
    media: { type: 'image', url: '' },
    size: 'regular',
    ...data
  };

  const { data: block, error } = await supabase
    .from('blocks')
    .insert({
      section_id: sectionId,
      type: 'testimonial',
      data: defaultData,
      order: 0, // Will be updated after insertion
    })
    .select()
    .single();

  if (error) throw error;
  return block;
}

export async function updateTestimonial(id: string, data: Partial<TestimonialData>) {
  const { data: block, error } = await supabase
    .from('blocks')
    .update({ data })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return block;
}

export async function deleteTestimonial(id: string) {
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

export async function reorderTestimonials(updates: { id: string; order: number }[]) {
  const { data, error } = await supabase.rpc('reorder_blocks', {
    updates: updates.map(update => ({
      id: update.id,
      order: update.order,
    })),
  });

  if (error) throw error;
  return data;
}
