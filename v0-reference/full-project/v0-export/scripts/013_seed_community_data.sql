-- Seed data for enhanced communities

-- Update existing communities with new fields
UPDATE communities SET 
  category = 'geographic',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'austin-disc-golf';

UPDATE communities SET 
  category = 'geographic',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'dfw-disc-golf';

UPDATE communities SET 
  category = 'geographic',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'houston-disc-golf';

UPDATE communities SET 
  category = 'organization',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'pdga-members';

UPDATE communities SET 
  category = 'interest',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'disc-collectors';

UPDATE communities SET 
  category = 'interest',
  cover_image = '/placeholder.svg?height=300&width=1200'
WHERE slug = 'tournament-players';

-- Add more communities
INSERT INTO communities (name, slug, description, icon, category, cover_image, privacy) VALUES
  ('Innova Fans', 'innova-fans', 'Fans of Innova disc golf discs', '🔴', 'brand', '/placeholder.svg?height=300&width=1200', 'public'),
  ('Discraft Army', 'discraft-army', 'Discraft enthusiasts and collectors', '🟡', 'brand', '/placeholder.svg?height=300&width=1200', 'public'),
  ('MVP/Axiom/Streamline', 'mvp-family', 'MVP, Axiom, and Streamline disc fans', '⚫', 'brand', '/placeholder.svg?height=300&width=1200', 'public'),
  ('Kastaplast Collective', 'kastaplast-collective', 'Kastaplast disc lovers', '🟢', 'brand', '/placeholder.svg?height=300&width=1200', 'public'),
  ('San Antonio Disc Golf', 'san-antonio-disc-golf', 'San Antonio area disc golfers', '🌵', 'geographic', '/placeholder.svg?height=300&width=1200', 'public'),
  ('Beginner Friendly', 'beginner-friendly', 'New to disc golf? Ask anything here!', '🌱', 'interest', '/placeholder.svg?height=300&width=1200', 'public'),
  ('Form Check', 'form-check', 'Get feedback on your throwing form', '🎥', 'interest', '/placeholder.svg?height=300&width=1200', 'public'),
  ('Course Reviews', 'course-reviews', 'Share and discover disc golf courses', '📍', 'interest', '/placeholder.svg?height=300&width=1200', 'public')
ON CONFLICT (slug) DO NOTHING;
