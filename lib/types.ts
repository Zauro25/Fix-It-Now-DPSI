export interface Facility {
  id: string;
  name: string;
  average_rating: number;
  photo_url: string; // Restoring the photo_url property
  latitude: number;
  longitude: number;
  description: string;
}

export interface Review {
  id: string;
  facility_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
}
