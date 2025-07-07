import { db, auth, type ApiResponse } from '@/lib/supabase'
import type { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate,
  Review,
  ReviewInsert,
  ReviewUpdate,
  ProfileFormData,
  ReviewFormData,
  Platform,
  VALIDATION_RULES
} from '@/types/database'

// Validation helpers
export const validateUsername = (username: string): string | null => {
  if (username.length < VALIDATION_RULES.username.minLength) {
    return VALIDATION_RULES.username.message
  }
  if (username.length > VALIDATION_RULES.username.maxLength) {
    return VALIDATION_RULES.username.message
  }
  if (!VALIDATION_RULES.username.pattern.test(username)) {
    return VALIDATION_RULES.username.message
  }
  return null
}

export const validateProfileData = (data: ProfileFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Username validation
  const usernameError = validateUsername(data.username)
  if (usernameError) {
    errors.username = usernameError
  }

  // Name validation
  if (!data.name || data.name.length < VALIDATION_RULES.name.minLength) {
    errors.name = VALIDATION_RULES.name.message
  }
  if (data.name && data.name.length > VALIDATION_RULES.name.maxLength) {
    errors.name = VALIDATION_RULES.name.message
  }

  // Bio validation
  if (data.bio && data.bio.length > VALIDATION_RULES.bio.maxLength) {
    errors.bio = VALIDATION_RULES.bio.message
  }

  // Profession validation
  if (data.profession && data.profession.length > VALIDATION_RULES.profession.maxLength) {
    errors.profession = VALIDATION_RULES.profession.message
  }

  return errors
}

export const validateReviewData = (data: ReviewFormData): Record<string, string> => {
  const errors: Record<string, string> = {}

  // Reviewer name validation
  if (!data.reviewer_name || data.reviewer_name.length < VALIDATION_RULES.reviewerName.minLength) {
    errors.reviewer_name = VALIDATION_RULES.reviewerName.message
  }
  if (data.reviewer_name && data.reviewer_name.length > VALIDATION_RULES.reviewerName.maxLength) {
    errors.reviewer_name = VALIDATION_RULES.reviewerName.message
  }

  // Review text validation
  if (!data.review_text || data.review_text.length < VALIDATION_RULES.reviewText.minLength) {
    errors.review_text = VALIDATION_RULES.reviewText.message
  }
  if (data.review_text && data.review_text.length > VALIDATION_RULES.reviewText.maxLength) {
    errors.review_text = VALIDATION_RULES.reviewText.message
  }

  // Rating validation
  if (data.rating !== undefined && (data.rating < VALIDATION_RULES.rating.min || data.rating > VALIDATION_RULES.rating.max)) {
    errors.rating = VALIDATION_RULES.rating.message
  }

  return errors
}

// Profile API functions
export const profileApi = {
  // Get current user's profile
  getCurrent: async (): Promise<ApiResponse<Profile>> => {
    try {
      return await db.profiles.getCurrent()
    } catch (error) {
      console.error('Error getting current profile:', error)
      return {
        success: false,
        error: 'Failed to get profile'
      }
    }
  },

  // Get public profile by username
  getByUsername: async (username: string): Promise<ApiResponse<any>> => {
    try {
      if (!username) {
        return {
          success: false,
          error: 'Username is required'
        }
      }
      return await db.profiles.getByUsername(username)
    } catch (error) {
      console.error('Error getting profile by username:', error)
      return {
        success: false,
        error: 'Failed to get profile'
      }
    }
  },

  // Create or update profile
  upsert: async (data: ProfileFormData): Promise<ApiResponse<Profile>> => {
    try {
      // Validate data
      const errors = validateProfileData(data)
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          error: Object.values(errors).join(', ')
        }
      }

      // Check username availability if creating new profile
      const { data: user } = await auth.getUser()
      if (!user.success || !user.data?.user) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      // Check if username is available (skip if it's the current user's username)
      const currentProfile = await db.profiles.getCurrent()
      const isUsernameChange = !currentProfile.success || currentProfile.data?.username !== data.username

      if (isUsernameChange) {
        const usernameAvailable = await db.profiles.isUsernameAvailable(data.username)
        if (!usernameAvailable.success || !usernameAvailable.data) {
          return {
            success: false,
            error: 'Username is already taken'
          }
        }
      }

      const profileData: ProfileInsert = {
        id: user.data.user.id,
        username: data.username.toLowerCase(),
        name: data.name,
        bio: data.bio || null,
        profession: data.profession || null
      }

      return await db.profiles.upsert(profileData)
    } catch (error) {
      console.error('Error upserting profile:', error)
      return {
        success: false,
        error: 'Failed to save profile'
      }
    }
  },

  // Update profile settings
  updateSettings: async (updates: Partial<ProfileUpdate>): Promise<ApiResponse<Profile>> => {
    try {
      const { data: user } = await auth.getUser()
      if (!user.success || !user.data?.user) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      const profileData: ProfileUpdate = {
        ...updates,
        id: user.data.user.id
      }

      return await db.profiles.upsert(profileData as ProfileInsert)
    } catch (error) {
      console.error('Error updating profile settings:', error)
      return {
        success: false,
        error: 'Failed to update settings'
      }
    }
  },

  // Check username availability
  isUsernameAvailable: async (username: string): Promise<ApiResponse<boolean>> => {
    try {
      const usernameError = validateUsername(username)
      if (usernameError) {
        return {
          success: false,
          error: usernameError
        }
      }

      return await db.profiles.isUsernameAvailable(username.toLowerCase())
    } catch (error) {
      console.error('Error checking username availability:', error)
      return {
        success: false,
        error: 'Failed to check username availability'
      }
    }
  }
}

// Review API functions
export const reviewApi = {
  // Get current user's reviews
  getCurrent: async (): Promise<ApiResponse<Review[]>> => {
    try {
      return await db.reviews.getCurrentUser()
    } catch (error) {
      console.error('Error getting current user reviews:', error)
      return {
        success: false,
        error: 'Failed to get reviews'
      }
    }
  },

  // Get public reviews by username
  getByUsername: async (username: string): Promise<ApiResponse<any[]>> => {
    try {
      if (!username) {
        return {
          success: false,
          error: 'Username is required'
        }
      }
      return await db.reviews.getByUsername(username)
    } catch (error) {
      console.error('Error getting reviews by username:', error)
      return {
        success: false,
        error: 'Failed to get reviews'
      }
    }
  },

  // Create review
  create: async (data: ReviewFormData): Promise<ApiResponse<Review>> => {
    try {
      // Validate data
      const errors = validateReviewData(data)
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          error: Object.values(errors).join(', ')
        }
      }

      const { data: user } = await auth.getUser()
      if (!user.success || !user.data?.user) {
        return {
          success: false,
          error: 'Not authenticated'
        }
      }

      const reviewData: ReviewInsert = {
        user_id: user.data.user.id,
        reviewer_name: data.reviewer_name,
        review_text: data.review_text,
        rating: data.rating || null,
        source: data.source,
        image_url: data.image_url || null,
        external_link: data.external_link || null
      }

      return await db.reviews.create(reviewData)
    } catch (error) {
      console.error('Error creating review:', error)
      return {
        success: false,
        error: 'Failed to create review'
      }
    }
  },

  // Update review
  update: async (id: string, data: Partial<ReviewFormData>): Promise<ApiResponse<Review>> => {
    try {
      // Validate data if provided
      if (Object.keys(data).length > 0) {
        const errors = validateReviewData(data as ReviewFormData)
        if (Object.keys(errors).length > 0) {
          return {
            success: false,
            error: Object.values(errors).join(', ')
          }
        }
      }

      const reviewData: ReviewUpdate = {
        ...data,
        image_url: data.image_url || null,
        external_link: data.external_link || null
      }

      return await db.reviews.update(id, reviewData)
    } catch (error) {
      console.error('Error updating review:', error)
      return {
        success: false,
        error: 'Failed to update review'
      }
    }
  },

  // Delete review
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      return await db.reviews.delete(id)
    } catch (error) {
      console.error('Error deleting review:', error)
      return {
        success: false,
        error: 'Failed to delete review'
      }
    }
  },

  // Update display order
  updateOrder: async (reviews: { id: string; display_order: number }[]): Promise<ApiResponse<void>> => {
    try {
      return await db.reviews.updateOrder(reviews)
    } catch (error) {
      console.error('Error updating review order:', error)
      return {
        success: false,
        error: 'Failed to update order'
      }
    }
  },

  // Toggle visibility
  toggleVisibility: async (id: string, isVisible: boolean): Promise<ApiResponse<Review>> => {
    try {
      return await db.reviews.update(id, { is_visible: isVisible })
    } catch (error) {
      console.error('Error toggling review visibility:', error)
      return {
        success: false,
        error: 'Failed to update visibility'
      }
    }
  },

  // Get review statistics
  getStats: async (username: string): Promise<ApiResponse<any[]>> => {
    try {
      if (!username) {
        return {
          success: false,
          error: 'Username is required'
        }
      }
      return await db.reviews.getStats(username)
    } catch (error) {
      console.error('Error getting review stats:', error)
      return {
        success: false,
        error: 'Failed to get statistics'
      }
    }
  }
}

// Auth API functions
export const authApi = {
  // Sign up
  signUp: async (email: string, password: string, profileData: ProfileFormData): Promise<ApiResponse<any>> => {
    try {
      // Validate profile data
      const errors = validateProfileData(profileData)
      if (Object.keys(errors).length > 0) {
        return {
          success: false,
          error: Object.values(errors).join(', ')
        }
      }

      // Check username availability
      const usernameAvailable = await db.profiles.isUsernameAvailable(profileData.username)
      if (!usernameAvailable.success || !usernameAvailable.data) {
        return {
          success: false,
          error: 'Username is already taken'
        }
      }

      // Sign up user
      const authResult = await auth.signUp(email, password, {
        username: profileData.username,
        name: profileData.name
      })

      if (!authResult.success) {
        return authResult
      }

      return {
        success: true,
        data: authResult.data
      }
    } catch (error) {
      console.error('Error signing up:', error)
      return {
        success: false,
        error: 'Failed to create account'
      }
    }
  },

  // Sign in
  signIn: async (email: string, password: string): Promise<ApiResponse<any>> => {
    try {
      return await auth.signIn(email, password)
    } catch (error) {
      console.error('Error signing in:', error)
      return {
        success: false,
        error: 'Failed to sign in'
      }
    }
  },

  // Sign out
  signOut: async (): Promise<ApiResponse<void>> => {
    try {
      return await auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      return {
        success: false,
        error: 'Failed to sign out'
      }
    }
  },

  // Get current user
  getUser: async (): Promise<ApiResponse<any>> => {
    try {
      return await auth.getUser()
    } catch (error) {
      console.error('Error getting user:', error)
      return {
        success: false,
        error: 'Failed to get user'
      }
    }
  }
}