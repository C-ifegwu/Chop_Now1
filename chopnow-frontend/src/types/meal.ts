export interface Meal {
  id: number;
  vendor_id: number;
  name: string;
  description: string;
  original_price: number;
  discounted_price: number;
  quantity_available: number;
  cuisine_type: string;
  pickup_options: string;
  pickup_times: string;
  allergens: string;
  image_url: string;
  is_available: number;
  created_at: string;
  updated_at: string;
  vendor_name: string;
  vendor_address: string;
  latitude: number;
  longitude: number;
  average_rating: number;
  review_count: number;
  total_orders?: number; // Make it optional as it's not always present
}
