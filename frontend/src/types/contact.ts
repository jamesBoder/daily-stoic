// Contact Types and Interfaces

// Contact Form Data Type
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  subject: ContactCategory;
}

// ContactCategory Enum/Type
export type ContactCategory = 'Feedback' | 'Support' | 'General Inquiry' | 'Other'; 

// Contact Form Props
export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  isSubmitting: boolean;
  error?: string;
}

// ContactSubmissionResponse Type
export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
}

// ContactInfo Type
export interface ContactInfo {
  email: string;
  github: string;
  responseTime: string; // e.g., "24-48 hours"
}

// ContactPage Props
export interface ContactPageProps {
  contactInfo: ContactInfo;
}