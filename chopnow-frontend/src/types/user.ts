export interface User {
  id: number;
  email: string;
  user_type: 'consumer' | 'vendor';
  phone: string;
  name: string;
  business_name: string;
  address: string;
}
