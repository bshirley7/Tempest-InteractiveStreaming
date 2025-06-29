import { createServiceClient } from '@/lib/supabase/service';

export interface ModerationResult {
  isAllowed: boolean;
  filteredContent: string;
  matchedRules: Array<{
    id: string;
    type: string;
    severity: string;
    action: string;
  }>;
  severityScore: number;
  requiresManualReview: boolean;
  actionTaken: 'allowed' | 'flagged' | 'blocked' | 'modified';
}

export interface ModerationRule {
  id: string;
  rule_type: 'banned_word' | 'banned_phrase' | 'regex_pattern' | 'spam_pattern';
  pattern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'flag' | 'block' | 'shadow_ban' | 'replace';
  replacement_text?: string;
  context?: string[];
}

// Severity scores for calculating cumulative impact
const SEVERITY_SCORES = {
  low: 1,
  medium: 5,
  high: 10,
  critical: 20
};

// Cache for moderation rules (refresh every 5 minutes)
let rulesCache: ModerationRule[] | null = null;
let rulesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get active moderation rules from database with caching
 */
async function getModerationRules(context?: string): Promise<ModerationRule[]> {
  const now = Date.now();
  
  // Use cache if available and not expired
  if (rulesCache && now - rulesCacheTime < CACHE_DURATION) {
    return context 
      ? rulesCache.filter(rule => !rule.context || rule.context.includes(context))
      : rulesCache;
  }

  const supabase = createServiceClient();
  
  if (!supabase) {
    console.error('Supabase client not configured for moderation');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('moderation_rules')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching moderation rules:', error);
      return rulesCache || [];
    }

    rulesCache = data || [];
    rulesCacheTime = now;

    return context 
      ? rulesCache.filter(rule => !rule.context || rule.context.includes(context))
      : rulesCache;
  } catch (error) {
    console.error('Error in getModerationRules:', error);
    return rulesCache || [];
  }
}

/**
 * Filter content through moderation rules
 */
export async function filterContent(
  content: string,
  context: string = 'chat',
  userId?: string
): Promise<ModerationResult> {
  // Quick validation
  if (!content || content.trim().length === 0) {
    return {
      isAllowed: true,
      filteredContent: content,
      matchedRules: [],
      severityScore: 0,
      requiresManualReview: false,
      actionTaken: 'allowed'
    };
  }

  const rules = await getModerationRules(context);
  const matchedRules: ModerationResult['matchedRules'] = [];
  let filteredContent = content;
  let severityScore = 0;
  let shouldBlock = false;
  let shouldFlag = false;
  let modified = false;

  // Check each rule
  for (const rule of rules) {
    let isMatch = false;
    
    try {
      const regex = new RegExp(rule.pattern, 'gi');
      isMatch = regex.test(content);
      
      if (isMatch) {
        matchedRules.push({
          id: rule.id,
          type: rule.rule_type,
          severity: rule.severity,
          action: rule.action
        });

        severityScore += SEVERITY_SCORES[rule.severity];

        // Apply action
        switch (rule.action) {
          case 'block':
            shouldBlock = true;
            break;
          
          case 'flag':
            shouldFlag = true;
            break;
          
          case 'replace':
            if (rule.replacement_text !== undefined) {
              const replacement = rule.replacement_text || '***';
              filteredContent = filteredContent.replace(regex, replacement);
              modified = true;
            }
            break;
          
          case 'shadow_ban':
            // Shadow ban doesn't modify content but marks for special handling
            shouldFlag = true;
            break;
        }
      }
    } catch (error) {
      console.error(`Invalid regex pattern in rule ${rule.id}:`, error);
    }
  }

  // Determine final action
  let actionTaken: ModerationResult['actionTaken'] = 'allowed';
  let isAllowed = true;

  if (shouldBlock) {
    actionTaken = 'blocked';
    isAllowed = false;
  } else if (modified) {
    actionTaken = 'modified';
    isAllowed = true;
  } else if (shouldFlag) {
    actionTaken = 'flagged';
    isAllowed = true; // Allow but flag for review
  }

  // Log moderation action if needed
  if (matchedRules.length > 0 && userId) {
    await logModerationAction(
      content,
      filteredContent,
      matchedRules,
      actionTaken,
      severityScore,
      context,
      userId
    );
  }

  return {
    isAllowed,
    filteredContent: isAllowed ? filteredContent : content,
    matchedRules,
    severityScore,
    requiresManualReview: shouldFlag || severityScore >= SEVERITY_SCORES.high,
    actionTaken
  };
}

/**
 * Log moderation action to database
 */
async function logModerationAction(
  originalContent: string,
  filteredContent: string,
  matchedRules: ModerationResult['matchedRules'],
  actionTaken: ModerationResult['actionTaken'],
  severityScore: number,
  contentType: string,
  userId: string
): Promise<void> {
  const supabase = createServiceClient();
  
  if (!supabase) return;

  try {
    await supabase
      .from('moderation_logs')
      .insert({
        content_type: contentType === 'chat' ? 'chat_message' : contentType,
        content_id: '00000000-0000-0000-0000-000000000000', // Placeholder, update when content is created
        user_id: userId,
        original_content: originalContent,
        filtered_content: filteredContent,
        matched_rules: matchedRules.map(r => r.id),
        action_taken: actionTaken,
        severity_score: severityScore,
        is_auto_moderated: true
      });
  } catch (error) {
    console.error('Error logging moderation action:', error);
  }
}

/**
 * Report content for manual review
 */
export async function reportContent(
  contentType: string,
  contentId: string,
  contentText: string,
  userId: string,
  reporterId: string,
  reason: string
): Promise<boolean> {
  const supabase = createServiceClient();
  
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('flagged_content_queue')
      .insert({
        content_type: contentType,
        content_id: contentId,
        user_id: userId,
        content_text: contentText,
        flag_reason: reason,
        severity: 'medium',
        reporter_id: reporterId,
        status: 'pending'
      });

    return !error;
  } catch (error) {
    console.error('Error reporting content:', error);
    return false;
  }
}

/**
 * Check if user is allowed to post based on moderation status
 */
export async function checkUserModerationStatus(userId: string): Promise<{
  canPost: boolean;
  isBanned: boolean;
  isShadowBanned: boolean;
}> {
  const supabase = createServiceClient();
  
  if (!supabase) {
    return { canPost: true, isBanned: false, isShadowBanned: false };
  }

  try {
    const { data, error } = await supabase
      .from('user_moderation_status')
      .select('is_banned, is_shadow_banned, banned_until')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // No moderation record means user is allowed
      return { canPost: true, isBanned: false, isShadowBanned: false };
    }

    const isBanned = data.is_banned && (!data.banned_until || new Date(data.banned_until) > new Date());
    
    return {
      canPost: !isBanned,
      isBanned,
      isShadowBanned: data.is_shadow_banned
    };
  } catch (error) {
    console.error('Error checking user moderation status:', error);
    return { canPost: true, isBanned: false, isShadowBanned: false };
  }
}

/**
 * Update user violation count
 */
export async function updateUserViolationCount(
  userId: string,
  severityScore: number
): Promise<void> {
  const supabase = createServiceClient();
  
  if (!supabase) return;

  try {
    // First, try to update existing record
    const { data: existing } = await supabase
      .from('user_moderation_status')
      .select('violation_count, warning_count')
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('user_moderation_status')
        .update({
          violation_count: existing.violation_count + 1,
          warning_count: existing.warning_count + (severityScore < SEVERITY_SCORES.high ? 1 : 0),
          last_violation_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else {
      // Create new record
      await supabase
        .from('user_moderation_status')
        .insert({
          user_id: userId,
          violation_count: 1,
          warning_count: severityScore < SEVERITY_SCORES.high ? 1 : 0,
          last_violation_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error updating user violation count:', error);
  }
}