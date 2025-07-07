-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 50),
    name TEXT NOT NULL CHECK (length(name) >= 1 AND length(name) <= 100),
    bio TEXT CHECK (length(bio) <= 500),
    profession TEXT CHECK (length(profession) <= 100),
    avatar_url TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reviewer_name TEXT NOT NULL CHECK (length(reviewer_name) >= 1 AND length(reviewer_name) <= 100),
    review_text TEXT NOT NULL CHECK (length(review_text) >= 1 AND length(review_text) <= 2000),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    source TEXT NOT NULL CHECK (source IN ('네이버', '카카오', '구글', '크몽', '숨고', '당근마켓')),
    image_url TEXT,
    external_link TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id_display_order ON reviews(user_id, display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON reviews(source);
CREATE INDEX IF NOT EXISTS idx_reviews_is_visible ON reviews(is_visible);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically set display_order
CREATE OR REPLACE FUNCTION set_review_display_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.display_order IS NULL OR NEW.display_order = 0 THEN
        NEW.display_order = (
            SELECT COALESCE(MAX(display_order), 0) + 1
            FROM reviews 
            WHERE user_id = NEW.user_id
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for display_order
CREATE TRIGGER set_review_display_order_trigger
    BEFORE INSERT ON reviews
    FOR EACH ROW EXECUTE FUNCTION set_review_display_order();

-- Create view for public profiles with review counts
CREATE VIEW public_profiles AS
SELECT 
    p.id,
    p.username,
    p.name,
    p.bio,
    p.profession,
    p.avatar_url,
    p.created_at,
    COUNT(r.id) as review_count,
    ROUND(AVG(r.rating), 1) as average_rating
FROM profiles p
LEFT JOIN reviews r ON p.id = r.user_id AND r.is_visible = true
WHERE p.is_public = true
GROUP BY p.id, p.username, p.name, p.bio, p.profession, p.avatar_url, p.created_at;

-- Create view for review statistics by platform
CREATE VIEW review_stats AS
SELECT 
    user_id,
    source,
    COUNT(*) as count,
    ROUND(AVG(rating), 1) as average_rating,
    MAX(created_at) as latest_review
FROM reviews
WHERE is_visible = true
GROUP BY user_id, source;

-- Add helpful comments
COMMENT ON TABLE profiles IS 'User profiles for the Re:cord service';
COMMENT ON TABLE reviews IS 'Reviews collected from various platforms';
COMMENT ON COLUMN profiles.username IS 'Unique username for public URLs (e.g., record.kr/username)';
COMMENT ON COLUMN reviews.source IS 'Platform where the review was collected';
COMMENT ON COLUMN reviews.display_order IS 'Order in which reviews should be displayed (lower numbers first)';
COMMENT ON COLUMN reviews.is_visible IS 'Whether the review should be shown on the public profile';
COMMENT ON VIEW public_profiles IS 'Public profiles with aggregated review statistics';
COMMENT ON VIEW review_stats IS 'Review statistics grouped by user and platform';