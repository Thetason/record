-- Re:cord Production Database Schema
-- This is the complete, production-ready database schema for Re:cord
-- Execute this file in Supabase SQL Editor for deployment

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 50),
  name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
  bio TEXT CHECK (length(bio) <= 500),
  profession TEXT CHECK (length(profession) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL CHECK (length(reviewer_name) >= 1 AND length(reviewer_name) <= 100),
  review_text TEXT NOT NULL CHECK (length(review_text) >= 10 AND length(review_text) <= 2000),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  source TEXT NOT NULL CHECK (source IN ('네이버', '카카오', '구글', '크몽', '숨고', '당근마켓')),
  image_url TEXT,
  external_link TEXT,
  is_visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON public.reviews(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON public.reviews(user_id, is_visible);

-- Function to automatically update display_order
CREATE OR REPLACE FUNCTION update_display_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Set display_order to max + 1 for new reviews
    NEW.display_order = COALESCE(
      (SELECT MAX(display_order) + 1 FROM public.reviews WHERE user_id = NEW.user_id),
      1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto display_order
DROP TRIGGER IF EXISTS trigger_update_display_order ON public.reviews;
CREATE TRIGGER trigger_update_display_order
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_display_order();

-- Function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create views for public access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  username,
  name,
  bio,
  profession,
  created_at
FROM public.profiles;

CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  r.reviewer_name,
  r.review_text,
  r.rating,
  r.source,
  r.image_url,
  r.external_link,
  r.display_order,
  r.created_at,
  p.username
FROM public.reviews r
JOIN public.profiles p ON r.user_id = p.id
WHERE r.is_visible = true
ORDER BY p.username, r.display_order;

CREATE OR REPLACE VIEW public.review_stats AS
SELECT 
  p.username,
  COUNT(r.id) as total_reviews,
  COUNT(CASE WHEN r.is_visible THEN 1 END) as visible_reviews,
  ROUND(AVG(r.rating), 1) as average_rating,
  array_agg(DISTINCT r.source) as platforms
FROM public.profiles p
LEFT JOIN public.reviews r ON p.id = r.user_id
GROUP BY p.username, p.id;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reviews policies
CREATE POLICY "Public reviews are viewable by everyone" ON public.reviews
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE public.profiles IS 'User profiles for the Re:cord service';
COMMENT ON TABLE public.reviews IS 'Reviews collected from various platforms';
COMMENT ON COLUMN public.profiles.username IS 'Unique username for public URLs (e.g., record.kr/username)';
COMMENT ON COLUMN public.reviews.source IS 'Platform where the review was collected';
COMMENT ON COLUMN public.reviews.display_order IS 'Order in which reviews should be displayed';
COMMENT ON COLUMN public.reviews.is_visible IS 'Whether the review should be shown on the public profile';
COMMENT ON VIEW public.public_profiles IS 'Public profiles for anonymous access';
COMMENT ON VIEW public.public_reviews IS 'Public reviews for anonymous access';
COMMENT ON VIEW public.review_stats IS 'Review statistics grouped by user';

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon;
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.review_stats TO anon;