-- Create moderation rules table
CREATE TABLE IF NOT EXISTS public.moderation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('banned_word', 'banned_phrase', 'regex_pattern', 'spam_pattern')),
  pattern TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action TEXT NOT NULL DEFAULT 'flag' CHECK (action IN ('flag', 'block', 'shadow_ban', 'replace')),
  replacement_text TEXT, -- Used when action is 'replace'
  context TEXT[], -- Specific contexts where rule applies (chat, comments, polls, etc)
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create moderation log table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('chat_message', 'interaction', 'poll', 'quiz')),
  content_id UUID NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  original_content TEXT NOT NULL,
  filtered_content TEXT,
  matched_rules UUID[], -- Array of rule IDs that matched
  action_taken TEXT NOT NULL CHECK (action_taken IN ('allowed', 'flagged', 'blocked', 'modified')),
  severity_score INTEGER DEFAULT 0, -- Cumulative severity score
  is_auto_moderated BOOLEAN DEFAULT true,
  moderator_id UUID REFERENCES public.user_profiles(id), -- If manually moderated
  moderator_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user moderation status table
CREATE TABLE IF NOT EXISTS public.user_moderation_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) UNIQUE NOT NULL,
  warning_count INTEGER DEFAULT 0,
  violation_count INTEGER DEFAULT 0,
  is_shadow_banned BOOLEAN DEFAULT false,
  is_banned BOOLEAN DEFAULT false,
  banned_until TIMESTAMPTZ,
  ban_reason TEXT,
  last_violation_at TIMESTAMPTZ,
  moderation_notes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create flagged content queue for manual review
CREATE TABLE IF NOT EXISTS public.flagged_content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('chat_message', 'interaction', 'poll', 'quiz')),
  content_id UUID NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id),
  content_text TEXT NOT NULL,
  flag_reason TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  matched_rules UUID[],
  reporter_id UUID REFERENCES public.user_profiles(id), -- If user-reported
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected', 'escalated')),
  reviewed_by UUID REFERENCES public.user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add moderation columns to chat_messages
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'flagged', 'blocked'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_rules_active ON public.moderation_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_moderation_rules_type ON public.moderation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_user ON public.moderation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_content ON public.moderation_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_flagged_queue_status ON public.flagged_content_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_user_moderation_status ON public.user_moderation_status(user_id);

-- Insert default moderation rules
INSERT INTO public.moderation_rules (rule_type, pattern, severity, action, context, description) VALUES
-- Profanity and slurs (using partial patterns to catch variations)
('banned_word', 'f[u*]ck', 'medium', 'replace', ARRAY['chat', 'comments'], 'Common profanity'),
('banned_word', 'sh[i*]t', 'low', 'replace', ARRAY['chat', 'comments'], 'Mild profanity'),
('banned_word', 'b[i*]tch', 'medium', 'replace', ARRAY['chat', 'comments'], 'Offensive language'),
('banned_word', 'n[i*]gg', 'critical', 'block', ARRAY['chat', 'comments', 'polls', 'quiz'], 'Racial slur'),
('banned_word', 'f[a*]g', 'critical', 'block', ARRAY['chat', 'comments', 'polls', 'quiz'], 'Homophobic slur'),

-- Spam patterns
('regex_pattern', '(.)\\1{4,}', 'low', 'flag', ARRAY['chat', 'comments'], 'Repeated characters spam'),
('regex_pattern', '([A-Z]{2,}\\s*){3,}', 'low', 'flag', ARRAY['chat', 'comments'], 'Excessive caps spam'),
('regex_pattern', '(https?://\\S+){3,}', 'medium', 'flag', ARRAY['chat', 'comments'], 'Multiple URLs spam'),
('regex_pattern', '\\b(buy|sell|discount|offer|deal)\\b.{0,20}\\b(now|today|limited|exclusive)\\b', 'medium', 'flag', ARRAY['chat', 'comments'], 'Commercial spam pattern'),

-- Harassment patterns
('banned_phrase', 'kill yourself', 'critical', 'block', ARRAY['chat', 'comments', 'polls', 'quiz'], 'Suicide encouragement'),
('banned_phrase', 'kys', 'critical', 'block', ARRAY['chat', 'comments', 'polls', 'quiz'], 'Suicide encouragement abbreviation'),
('regex_pattern', '\\b(die|death|kill)\\s+(you|ur|your)', 'high', 'block', ARRAY['chat', 'comments'], 'Death threats'),

-- Contact info patterns (for privacy)
('regex_pattern', '\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b', 'medium', 'flag', ARRAY['chat', 'comments'], 'Email addresses'),
('regex_pattern', '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b', 'medium', 'flag', ARRAY['chat', 'comments'], 'Phone numbers'),
('regex_pattern', '\\b\\d{3}-\\d{2}-\\d{4}\\b', 'high', 'block', ARRAY['chat', 'comments'], 'SSN pattern')
ON CONFLICT DO NOTHING;

-- Create function to check content against moderation rules
CREATE OR REPLACE FUNCTION check_content_moderation(
  p_content TEXT,
  p_context TEXT DEFAULT 'chat'
) RETURNS TABLE (
  rule_id UUID,
  rule_type TEXT,
  severity TEXT,
  action TEXT,
  replacement_text TEXT,
  matched BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rule_type,
    r.severity,
    r.action,
    r.replacement_text,
    CASE 
      WHEN r.rule_type = 'banned_word' THEN p_content ~* r.pattern
      WHEN r.rule_type = 'banned_phrase' THEN p_content ~* r.pattern
      WHEN r.rule_type = 'regex_pattern' THEN p_content ~* r.pattern
      ELSE false
    END as matched
  FROM public.moderation_rules r
  WHERE r.is_active = true
    AND (r.context IS NULL OR p_context = ANY(r.context))
    AND (
      (r.rule_type IN ('banned_word', 'banned_phrase') AND p_content ~* r.pattern) OR
      (r.rule_type = 'regex_pattern' AND p_content ~* r.pattern)
    );
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies
ALTER TABLE public.moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_moderation_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_content_queue ENABLE ROW LEVEL SECURITY;

-- Admins can manage moderation rules
CREATE POLICY "Admins can manage moderation rules" ON public.moderation_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Anyone can read active rules (for client-side pre-filtering)
CREATE POLICY "Public can read active moderation rules" ON public.moderation_rules
  FOR SELECT USING (is_active = true);

-- Moderators can view moderation logs
CREATE POLICY "Moderators can view moderation logs" ON public.moderation_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Users can view their own moderation status
CREATE POLICY "Users can view own moderation status" ON public.user_moderation_status
  FOR SELECT USING (user_id = auth.uid());

-- Moderators can manage user moderation status
CREATE POLICY "Moderators can manage user moderation status" ON public.user_moderation_status
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Moderators can manage flagged content queue
CREATE POLICY "Moderators can manage flagged content" ON public.flagged_content_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Users can report content
CREATE POLICY "Users can report content" ON public.flagged_content_queue
  FOR INSERT WITH CHECK (reporter_id = auth.uid());