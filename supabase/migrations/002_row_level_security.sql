-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for migration safety)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Public reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;

-- Profiles table policies
CREATE POLICY "Public profiles are viewable by everyone" 
    ON profiles FOR SELECT 
    USING (is_public = true);

CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Reviews table policies
CREATE POLICY "Public reviews are viewable by everyone" 
    ON reviews FOR SELECT 
    USING (
        is_visible = true 
        AND EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = reviews.user_id 
            AND profiles.is_public = true
        )
    );

CREATE POLICY "Users can view own reviews" 
    ON reviews FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews" 
    ON reviews FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" 
    ON reviews FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" 
    ON reviews FOR DELETE 
    USING (auth.uid() = user_id);

-- Function to check if username is available
CREATE OR REPLACE FUNCTION is_username_available(username_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE lower(username) = lower(username_to_check)
    );
$$;

-- Function to get user profile by username (public data only)
CREATE OR REPLACE FUNCTION get_public_profile(username_to_get TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    name TEXT,
    bio TEXT,
    profession TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    review_count BIGINT,
    average_rating NUMERIC
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
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
    WHERE lower(p.username) = lower(username_to_get) 
    AND p.is_public = true
    GROUP BY p.id, p.username, p.name, p.bio, p.profession, p.avatar_url, p.created_at;
$$;

-- Function to get public reviews for a user
CREATE OR REPLACE FUNCTION get_public_reviews(username_to_get TEXT)
RETURNS TABLE (
    id UUID,
    reviewer_name TEXT,
    review_text TEXT,
    rating INTEGER,
    source TEXT,
    image_url TEXT,
    external_link TEXT,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        r.id,
        r.reviewer_name,
        r.review_text,
        r.rating,
        r.source,
        r.image_url,
        r.external_link,
        r.display_order,
        r.created_at
    FROM reviews r
    JOIN profiles p ON r.user_id = p.id
    WHERE lower(p.username) = lower(username_to_get)
    AND p.is_public = true
    AND r.is_visible = true
    ORDER BY r.display_order ASC, r.created_at DESC;
$$;

-- Function to get review statistics by platform
CREATE OR REPLACE FUNCTION get_review_stats(username_to_get TEXT)
RETURNS TABLE (
    source TEXT,
    count BIGINT,
    average_rating NUMERIC,
    latest_review TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        r.source,
        COUNT(*) as count,
        ROUND(AVG(r.rating), 1) as average_rating,
        MAX(r.created_at) as latest_review
    FROM reviews r
    JOIN profiles p ON r.user_id = p.id
    WHERE lower(p.username) = lower(username_to_get)
    AND p.is_public = true
    AND r.is_visible = true
    GROUP BY r.source
    ORDER BY count DESC;
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Add helpful comments
COMMENT ON FUNCTION is_username_available IS 'Check if a username is available for registration';
COMMENT ON FUNCTION get_public_profile IS 'Get public profile data with review statistics';
COMMENT ON FUNCTION get_public_reviews IS 'Get visible reviews for a public profile';
COMMENT ON FUNCTION get_review_stats IS 'Get review statistics grouped by platform for a user';