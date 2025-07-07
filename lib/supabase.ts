import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client-side Supabase client
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
)

// Server-side Supabase client (for server components and API routes)
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Type helpers for better TypeScript support
export type SupabaseClient = typeof supabase

// Error handling utility
export class SupabaseError extends Error {
  constructor(
    message: string, 
    public code?: string, 
    public details?: string
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// Response wrapper for consistent error handling
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

// Helper function to handle Supabase responses
export function handleSupabaseResponse<T>(
  response: { data: T | null; error: any }
): ApiResponse<T> {
  if (response.error) {
    console.error('Supabase error:', response.error)
    return {
      success: false,
      error: response.error.message || 'An unexpected error occurred'
    }
  }

  return {
    success: true,
    data: response.data || undefined
  }
}

// Helper function to handle Supabase auth responses
export function handleSupabaseAuthResponse(
  response: any
): ApiResponse<any> {
  if (response.error) {
    console.error('Supabase auth error:', response.error)
    return {
      success: false,
      error: response.error.message || 'An unexpected error occurred'
    }
  }

  return {
    success: true,
    data: response.data
  }
}

// Auth helpers
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: Record<string, any>) => {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return handleSupabaseAuthResponse(response)
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return handleSupabaseAuthResponse(response)
  },

  // Sign out
  signOut: async () => {
    const response = await supabase.auth.signOut()
    return handleSupabaseAuthResponse(response)
  },

  // Get current user
  getUser: async () => {
    const response = await supabase.auth.getUser()
    return handleSupabaseAuthResponse(response)
  },

  // Get current session
  getSession: async () => {
    const response = await supabase.auth.getSession()
    return handleSupabaseAuthResponse(response)
  }
}

// Database helpers
export const db = {
  // Profiles
  profiles: {
    // Get public profile by username
    getByUsername: async (username: string) => {
      const response = await supabase
        .rpc('get_public_profile', { username_to_get: username })
        .single()
      return handleSupabaseResponse(response)
    },

    // Get current user's profile
    getCurrent: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single()
      return handleSupabaseResponse(response)
    },

    // Create or update profile
    upsert: async (profile: Database['public']['Tables']['profiles']['Insert']) => {
      const response = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single()
      return handleSupabaseResponse(response)
    },

    // Check if username is available
    isUsernameAvailable: async (username: string) => {
      const response = await supabase
        .rpc('is_username_available', { username_to_check: username })
      return handleSupabaseResponse(response)
    }
  },

  // Reviews
  reviews: {
    // Get public reviews by username
    getByUsername: async (username: string) => {
      const response = await supabase
        .rpc('get_public_reviews', { username_to_get: username })
      return handleSupabaseResponse(response)
    },

    // Get current user's reviews
    getCurrentUser: async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) {
        return { success: false, error: 'Not authenticated' }
      }

      const response = await supabase
        .from('reviews')
        .select('*')
        .eq('user_id', user.user.id)
        .order('display_order', { ascending: true })
      return handleSupabaseResponse(response)
    },

    // Create review
    create: async (review: Database['public']['Tables']['reviews']['Insert']) => {
      const response = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single()
      return handleSupabaseResponse(response)
    },

    // Update review
    update: async (id: string, updates: Database['public']['Tables']['reviews']['Update']) => {
      const response = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return handleSupabaseResponse(response)
    },

    // Delete review
    delete: async (id: string) => {
      const response = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
      return handleSupabaseResponse(response)
    },

    // Update display order
    updateOrder: async (reviews: { id: string; display_order: number }[]) => {
      const promises = reviews.map(({ id, display_order }) =>
        supabase
          .from('reviews')
          .update({ display_order })
          .eq('id', id)
      )
      
      const responses = await Promise.all(promises)
      const hasError = responses.some(r => r.error)
      
      if (hasError) {
        return { success: false, error: 'Failed to update order' }
      }
      
      return { success: true }
    },

    // Get review statistics
    getStats: async (username: string) => {
      const response = await supabase
        .rpc('get_review_stats', { username_to_get: username })
      return handleSupabaseResponse(response)
    }
  }
}

// Storage helpers for file uploads
export const storage = {
  // Upload avatar
  uploadAvatar: async (file: File, userId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/avatar.${fileExt}`
    
    const response = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type 
      })
    
    if (response.error) {
      return handleSupabaseResponse(response)
    }
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    return {
      success: true,
      data: urlData.publicUrl
    }
  },

  // Upload review image
  uploadReviewImage: async (file: File, userId: string, reviewId: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/reviews/${reviewId}.${fileExt}`
    
    const response = await supabase.storage
      .from('review-images')
      .upload(fileName, file, { 
        upsert: true,
        contentType: file.type 
      })
    
    if (response.error) {
      return handleSupabaseResponse(response)
    }
    
    const { data: urlData } = supabase.storage
      .from('review-images')
      .getPublicUrl(fileName)
    
    return {
      success: true,
      data: urlData.publicUrl
    }
  }
}