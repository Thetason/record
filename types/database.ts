export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          name: string
          bio: string | null
          profession: string | null
          avatar_url: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          name: string
          bio?: string | null
          profession?: string | null
          avatar_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          name?: string
          bio?: string | null
          profession?: string | null
          avatar_url?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          reviewer_name: string
          review_text: string
          rating: number | null
          source: string
          image_url: string | null
          external_link: string | null
          display_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          reviewer_name: string
          review_text: string
          rating?: number | null
          source: string
          image_url?: string | null
          external_link?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          reviewer_name?: string
          review_text?: string
          rating?: number | null
          source?: string
          image_url?: string | null
          external_link?: string | null
          display_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string | null
          username: string | null
          name: string | null
          bio: string | null
          profession: string | null
          avatar_url: string | null
          created_at: string | null
          review_count: number | null
          average_rating: number | null
        }
        Relationships: []
      }
      review_stats: {
        Row: {
          user_id: string | null
          source: string | null
          count: number | null
          average_rating: number | null
          latest_review: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_username_available: {
        Args: {
          username_to_check: string
        }
        Returns: boolean
      }
      get_public_profile: {
        Args: {
          username_to_get: string
        }
        Returns: {
          id: string
          username: string
          name: string
          bio: string | null
          profession: string | null
          avatar_url: string | null
          created_at: string
          review_count: number
          average_rating: number | null
        }[]
      }
      get_public_reviews: {
        Args: {
          username_to_get: string
        }
        Returns: {
          id: string
          reviewer_name: string
          review_text: string
          rating: number | null
          source: string
          image_url: string | null
          external_link: string | null
          display_order: number
          created_at: string
        }[]
      }
      get_review_stats: {
        Args: {
          username_to_get: string
        }
        Returns: {
          source: string
          count: number
          average_rating: number | null
          latest_review: string
        }[]
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

// Additional custom types for the application
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type PublicProfile = Database['public']['Views']['public_profiles']['Row']
export type ReviewStats = Database['public']['Views']['review_stats']['Row']

// Platform types
export type Platform = '네이버' | '카카오' | '구글' | '크몽' | '숨고' | '당근마켓'

export const PLATFORMS: Platform[] = [
  '네이버',
  '카카오',
  '구글',
  '크몽',
  '숨고',
  '당근마켓'
]

// Platform configuration with colors and icons
export interface PlatformConfig {
  name: Platform
  displayName: string
  color: string
  bgColor: string
  textColor: string
  icon: string
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  '네이버': {
    name: '네이버',
    displayName: '네이버',
    color: '#03C75A',
    bgColor: '#03C75A',
    textColor: '#FFFFFF',
    icon: 'N'
  },
  '카카오': {
    name: '카카오',
    displayName: '카카오',
    color: '#FEE500',
    bgColor: '#FEE500',
    textColor: '#3C1E1E',
    icon: 'K'
  },
  '구글': {
    name: '구글',
    displayName: '구글',
    color: '#4285F4',
    bgColor: '#4285F4',
    textColor: '#FFFFFF',
    icon: 'G'
  },
  '크몽': {
    name: '크몽',
    displayName: '크몽',
    color: '#FFD400',
    bgColor: '#FFD400',
    textColor: '#000000',
    icon: '크'
  },
  '숨고': {
    name: '숨고',
    displayName: '숨고',
    color: '#00C7AE',
    bgColor: '#00C7AE',
    textColor: '#FFFFFF',
    icon: '숨'
  },
  '당근마켓': {
    name: '당근마켓',
    displayName: '당근마켓',
    color: '#FF6F0F',
    bgColor: '#FF6F0F',
    textColor: '#FFFFFF',
    icon: '🥕'
  }
}

// Form validation types
export interface ProfileFormData {
  username: string
  name: string
  bio?: string
  profession?: string
}

export interface ReviewFormData {
  reviewer_name: string
  review_text: string
  rating?: number
  source: Platform
  image_url?: string
  external_link?: string
}

// API response types
export interface ApiError {
  message: string
  code?: string
  details?: string
}

export interface ApiSuccess<T = any> {
  data: T
  message?: string
}

// Utility types for better type safety
export type RequiredProfile = Required<Pick<Profile, 'id' | 'username' | 'name'>>
export type OptionalProfile = Partial<Omit<Profile, 'id' | 'username' | 'name'>>

export type RequiredReview = Required<Pick<Review, 'user_id' | 'reviewer_name' | 'review_text' | 'source'>>
export type OptionalReview = Partial<Omit<Review, 'user_id' | 'reviewer_name' | 'review_text' | 'source'>>

// Validation constraints (matching database constraints)
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    message: '사용자명은 3-50자의 영문, 숫자, 언더스코어, 하이픈만 사용 가능합니다.'
  },
  name: {
    minLength: 1,
    maxLength: 100,
    message: '이름은 1-100자 사이여야 합니다.'
  },
  bio: {
    maxLength: 500,
    message: '자기소개는 500자 이하여야 합니다.'
  },
  profession: {
    maxLength: 100,
    message: '직업/전문분야는 100자 이하여야 합니다.'
  },
  reviewerName: {
    minLength: 1,
    maxLength: 100,
    message: '리뷰어 이름은 1-100자 사이여야 합니다.'
  },
  reviewText: {
    minLength: 1,
    maxLength: 2000,
    message: '리뷰 내용은 1-2000자 사이여야 합니다.'
  },
  rating: {
    min: 1,
    max: 5,
    message: '평점은 1-5 사이의 값이어야 합니다.'
  }
} as const