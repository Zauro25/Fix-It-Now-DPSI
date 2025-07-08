import { supabase } from './supabase';
import type { Facility, Review, Tag } from './types';

// Add total_ratings_count to the Facility type extension
interface FacilityWithRatingCount extends Facility {
  total_ratings_count: number;
}

export const getFacilities = async (): Promise<FacilityWithRatingCount[]> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('id, name, photo_url, description, average_rating, total_ratings_count'); // Restored photo_url

  if (error) {
    console.error('Error fetching all facilities:', error.message);
    return [];
  }

  if (!data) {
    return [];
  }

  const facilities: FacilityWithRatingCount[] = data.map((f: any) => ({
    id: f.id,
    name: f.name,
    average_rating: f.average_rating,
    total_ratings_count: f.total_ratings_count,
    photo_url: f.photo_url, // Restored
    latitude: 0,
    longitude: 0,
    description: f.description,
  }));

  return facilities;
};

export const getFacilityById = async (id: string): Promise<Facility | null> => {
  const { data, error } = await supabase
    .from('facilities')
    .select('*, total_ratings_count, total_comments_count, total_likes_count')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching facility with id ${id}:`, error.message);
    return null;
  }
  
  if (!data) {
    return null;
  }

  const facility: Facility & { total_ratings_count: number, total_comments_count: number, total_likes_count: number } = {
    id: data.id,
    name: data.name,
    average_rating: data.average_rating,
    photo_url: data.photo_url, // Restored
    latitude: data.latitude,
    longitude: data.longitude,
    description: data.description,
    total_ratings_count: data.total_ratings_count,
    total_comments_count: data.total_comments_count,
    total_likes_count: data.total_likes_count,
  };

  return facility;
};

export const getReviewsByFacilityId = async (facilityId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('facility_reviews')
    .select('*')
    .eq('facility_id', facilityId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching reviews for facility ${facilityId}:`, error.message);
    return [];
  }

  if (!data) {
    return [];
  }

  const reviews: Review[] = data.map((r: any) => ({
    id: r.review_id,
    facility_id: r.facility_id,
    user_name: 'Anonymous',
    user_avatar: '',
    rating: r.score,
    comment: r.comment,
    created_at: r.created_at,
  }));

  return reviews;
};

export const getTagsByFacilityId = async (facilityId: string): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('facility_tags')
    .select('tags(tag_id, tag_name)')
    .eq('facility_id', facilityId);

  if (error) {
    console.error(`Error fetching tags for facility ${facilityId}:`, error.message);
    return [];
  }

  if (!data) {
    return [];
  }

  const tags: Tag[] = data.map((d: any) => ({
      id: d.tags.tag_id,
      name: d.tags.tag_name
  }));

  return tags;
};

export const getAllTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('tag_id, tag_name');

  if (error) {
    console.error('Error fetching all tags:', error.message);
    return [];
  }
  
  if (!data) {
      return [];
  }

  const tags: Tag[] = data.map((t: any) => ({
      id: t.tag_id,
      name: t.tag_name
  }));

  return tags;
}

export const getAllFacilityTypes = async (): Promise<string[]> => {
  console.warn("getAllFacilityTypes is called, but 'facilities.type' column does not exist. Returning empty array.");
  return [];
}
