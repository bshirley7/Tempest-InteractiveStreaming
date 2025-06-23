# Ad Creation Strategy - Parody Companies

## Ad Types & Creation Methods

### 1. Video Ads (VEO3 Generated)
**Use Cases**: Pre-roll, mid-roll, post-roll in VOD; Scheduled breaks in live channels
**Duration**: 15-30 seconds each
**Total Needed**: 15-20 video ads

### 2. Overlay Image Ads (AI Generated)
**Use Cases**: Pause overlays, interactive overlays during live content
**Formats**: 
- Banner (728x90)
- Medium Rectangle (300x250)
- Half-page (300x600)
**Total Needed**: 20-30 static ads

### 3. Sponsored Interactive Elements
**Use Cases**: Branded polls, sponsored quizzes
**Creation**: Text-based with company branding

## Parody Company Ad Inventory

### Galactic Pizza 🍕
**Video Ads (3 versions)**:
1. Late-night delivery - "Studying at 2 AM? We deliver faster than light!"
2. Lunch rush - "It's noon and you're starving. Galactic Pizza to the rescue!"
3. Group order - "Feed your study group. Universe-sized pizzas!"

**Overlay Ads (4 versions)**:
1. Pause overlay - Full menu display
2. Banner - "Order now, get free cosmic breadsticks"
3. Interactive - "Feeling hungry?" with order button
4. Time-based - "It's lunch time! 20% off orders now"

### Cuba Technologies 💻
**Video Ads (3 versions)**:
1. Recruitment - "Your CUDA skills = $200k starting. Show me the money!"
2. Career fair - "Cuba Technologies is hiring. GPUs, AI, and fat stacks!"
3. Success story - "From dorm room to data center. Join Cuba Technologies!"

**Overlay Ads (4 versions)**:
1. Career channel exclusive - "Watching career content? We're watching you!"
2. Tech content triggered - "Love tech? We love tech lovers. Apply now!"
3. High engagement - "Active learner detected. Let's talk compensation!"
4. Achievement based - "Aced that quiz? Ace your interview with us!"

### Liquid Thunder ⚡
**Video Ads (2 versions)**:
1. All-nighter - "When your energy dies, resurrect it with Liquid Thunder!"
2. Pre-game - "Strike your thirst dead before the big game!"

**Overlay Ads (3 versions)**:
1. Late-night trigger - "Still watching at 1 AM? You need Liquid Thunder!"
2. Study content - "Brain fog? Lightning in a can!"
3. Marathon viewing - "3 hours of content? Stay charged!"

### HungryHawk 🦅
**Video Ads (2 versions)**:
1. Lunch delivery - "It's noon! HungryHawk swoops in with campus favorites!"
2. Quick service - "From order to dorm in 15 minutes. Guaranteed!"

**Overlay Ads (3 versions)**:
1. Time-based - "It's [current time]. Hungry? HungryHawk delivers!"
2. Location-based - "Stuck in the library? We deliver there!"
3. Weather-based - "Too cold to walk? Let HungryHawk swoop in!"

### CampusCash 💰
**Video Ads (2 versions)**:
1. Investment intro - "Turn spare change into yacht money. CampusCash!"
2. Success story - "Started with $5, now driving a Tesla. True story!"

**Overlay Ads (3 versions)**:
1. Smart targeting - "Smart viewer, smart investments. Start with $5!"
2. Achievement - "High quiz score = high financial IQ. Invest now!"
3. Career content - "Planning your future? Plan your wealth too!"

### Outwest Steakhouse 🥩
**Video Ad (1 version)**:
1. Celebration - "Aced your finals? Celebrate with 32oz of pure beef!"

**Overlay Ads (2 versions)**:
1. Sports viewing - "Watching the game? Come watch at Outwest!"
2. Weekend promo - "Friday night = Steak night. No vegetables allowed!"

### BrainrotGG 🎮
**Video Ad (1 version)**:
1. Monetization - "Stop watching others get rich. Stream your gameplay!"

**Overlay Ads (2 versions)**:
1. Gaming content - "Like what you see? Start streaming, start earning!"
2. Late night - "3 AM gaming session? Make it profitable!"

### FitFlex Gym 💪
**Video Ad (1 version)**:
1. Student special - "Student stress? Sweat it out. $19/month!"

**Overlay Ads (2 versions)**:
1. Morning trigger - "Start your day right. FitFlex is open!"
2. Wellness content - "Inspired? Join FitFlex today!"

## Creation Workflow

### VEO3 Video Ad Prompts
```
"Create a 15-20 second commercial for [Company Name], a [description]. 
The scene should show [specific scenario]. Include the tagline '[tagline]' 
and end with a clear call-to-action. Style: Modern, upbeat, targeting 
college students. Include company logo/branding throughout."
```

### AI Image Ad Prompts
```
"Create a digital display ad for [Company Name], [dimensions]. 
Include: Company logo, tagline '[tagline]', [specific offer/message], 
call-to-action button. Style: Modern, eye-catching, targeting college 
students. Color scheme: [company colors]."
```

## Behavioral Targeting Logic

### Time-Based Triggers
```javascript
// Lunch time (11 AM - 2 PM)
if (currentHour >= 11 && currentHour <= 14) {
  prioritizeAds(['HungryHawk', 'Galactic Pizza', 'Outwest Steakhouse']);
}

// Late night (10 PM - 3 AM)
if (currentHour >= 22 || currentHour <= 3) {
  prioritizeAds(['Liquid Thunder', 'Galactic Pizza', 'BrainrotGG']);
}

// Morning (6 AM - 9 AM)
if (currentHour >= 6 && currentHour <= 9) {
  prioritizeAds(['FitFlex Gym', 'HungryHawk', 'Liquid Thunder']);
}
```

### Content-Based Triggers
```javascript
// Watching career content
if (channel === 'career-compass') {
  showAd('Cuba Technologies', 'career-focused');
}

// High quiz participation
if (quizScore > 0.8) {
  showAd('CampusCash', 'smart-investor');
}

// Long viewing session
if (sessionDuration > 7200) { // 2 hours
  showAd('Liquid Thunder', 'marathon-viewer');
}
```

### Interaction-Based Triggers
```javascript
// Frequent poll participation
if (pollParticipationRate > 0.7) {
  showAd('Cuba Technologies', 'engaged-learner');
}

// High emoji usage
if (emojiReactionCount > 20) {
  showAd('BrainrotGG', 'active-viewer');
}
```

## Demo Showcase Scenarios

### Scenario 1: Lunch Time Demo
**Time**: 12:30 PM
**Sequence**:
1. User watching any content
2. Pause → HungryHawk overlay "It's lunch time!"
3. Resume → Galactic Pizza pre-roll
4. Interactive poll sponsored by Outwest Steakhouse

### Scenario 2: Late Night Study
**Time**: 11 PM
**Sequence**:
1. User watching educational content
2. Liquid Thunder overlay appears
3. Quiz sponsored by Cuba Technologies
4. Post-content: CampusCash investment ad

### Scenario 3: Career Content Journey
**Channel**: Career Compass
**Sequence**:
1. Cuba Technologies pre-roll
2. Mid-content poll about career interests
3. Based on poll → targeted Cuba Technologies variant
4. End screen: CampusCash "Invest your signing bonus"

## Production Timeline

### Week 2 - Ad Creation Sprint (1 day)
**Morning (4 hours)**:
- Generate all VEO3 video ads
- Create scripts and prompts
- Render and download

**Afternoon (4 hours)**:
- Generate all AI image overlays
- Create multiple sizes/formats
- Organize by company and trigger type

## File Organization
```
/ads
  /video
    /galactic-pizza
      - gp_late_night_15s.mp4
      - gp_lunch_rush_20s.mp4
      - gp_group_order_15s.mp4
    /cuba-technologies
      - ct_recruitment_30s.mp4
      - ct_career_fair_20s.mp4
      - ct_success_story_30s.mp4
    [etc...]
  /images
    /overlays
      - galactic_pizza_pause_1920x1080.png
      - hungryhawk_lunch_banner_728x90.png
      - cuba_tech_career_300x250.png
    [etc...]
  /metadata
    - ad_inventory.json
    - targeting_rules.json
```

This comprehensive ad strategy shows judges how behavioral data creates 10x more valuable ad inventory than traditional demographic targeting!