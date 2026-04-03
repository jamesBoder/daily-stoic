
// init user interface 


// Define the structure of a User object
export interface User {
  id: number;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
  // Email verification
  email_verified?: boolean;
  // Google OAuth Fields
  google_id?: string;
  google_email?: string;
  google_picture?: string;
  is_google_linked?: boolean;
  // Guest Mode
  is_guest?: boolean;
}


// Define the structure of an authentication response
export interface AuthResponse {
  token: string;
  user: User;
}


// Define the structure of login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}


// Define the structure of signup credentials
export interface SignupCredentials {
  email: string;
  username: string;
  password: string;
  name?: string;
}