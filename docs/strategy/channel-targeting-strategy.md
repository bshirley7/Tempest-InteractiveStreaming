# Channel-Based Ad Targeting Strategy

## Advertiser-to-Channel Mapping

### Campus Pulse 📰
**Primary Advertisers**:
- **HungryHawk** - "Breaking: It's lunch time! Order now"
- **Phoenix State University** - Event promotions
- **CampusCash** - "Stay informed, stay invested"

**Targeting Logic**: News viewers = engaged students likely to order food during updates

### World Explorer 🌍
**Primary Advertisers**:
- **PrimeZoom** - "Travel gear at unbeatable prices"
- **CampusCash** - "Save for your dream trip"
- **Cuba Technologies** - "Work remotely from anywhere"

**Targeting Logic**: Travel content viewers = aspirational, planning future

### Mind Feed 🧠
**Primary Advertisers**:
- **Cuba Technologies** - "Your curiosity is worth $200k+"
- **PrimeZoom** - "Textbooks and learning materials"
- **Liquid Thunder** - "Fuel your mind marathons"

**Targeting Logic**: Documentary viewers = knowledge seekers, potential high achievers

### Career Compass 💼
**Primary Advertisers**:
- **Cuba Technologies** - Primary sponsor
- **CampusCash** - "Invest your signing bonus"
- **Outwest Steakhouse** - "Celebrate your job offer"

**Targeting Logic**: Career content = actively job hunting, high conversion

### Quiz Quest 🧩
**Primary Advertisers**:
- **CampusCash** - "Smart players make smart investments"
- **PrimeZoom** - "Win trivia, win discounts!"
- **Liquid Thunder** - "Keep your brain sharp"

**Targeting Logic**: Trivia players = engaged, competitive, achievement-oriented

### How-To Hub 🔧
**Primary Advertisers**:
- **PrimeZoom** - "Get the supplies you need"
- **HungryHawk** - "Too busy to cook? We deliver"
- **FitFlex Gym** - "Learn fitness basics with us"

**Targeting Logic**: Tutorial viewers = self-improvement focused, DIY mindset

### The Study Break 🎮
**Primary Advertisers**:
- **BrainrotGG** - "Turn gaming into income"
- **Galactic Pizza** - "Gaming fuel delivered fast"
- **PrimeZoom** - "Gaming gear and accessories"

**Targeting Logic**: Entertainment viewers = leisure time, impulse purchases

### Wellness Wave 🧘
**Primary Advertisers**:
- **FitFlex Gym** - Primary sponsor
- **HungryHawk** - "Healthy options available"
- **Liquid Thunder** - "Natural energy boost"

**Targeting Logic**: Wellness viewers = health-conscious, routine-oriented

### Future Lab 🚀
**Primary Advertisers**:
- **Cuba Technologies** - "Build the future with us"
- **BrainrotGG** - "Stream your coding sessions"
- **CampusCash** - "Invest in tech stocks"

**Targeting Logic**: Tech viewers = innovators, early adopters, high earning potential

## Time-Based Targeting Overlays

### Morning (7-10 AM)
```javascript
if (channel === "campus-pulse" && time < 10) {
  showAd("HungryHawk", "Breakfast delivered to your dorm!");
}
```

### Lunch Time (11 AM-2 PM)
```javascript
if (time >= 11 && time <= 14) {
  prioritizeAds(["HungryHawk", "Galactic Pizza", "Outwest Steakhouse"]);
  showContextualMessage("It's almost lunch time!");
}
```

### Late Night (10 PM-2 AM)
```javascript
if (time >= 22 || time <= 2) {
  if (channel === "study-break") {
    showAd("Galactic Pizza", "Late night gaming? We deliver until 3 AM!");
  }
  if (channel === "mind-feed") {
    showAd("Liquid Thunder", "Documentary marathon? Stay energized!");
  }
}
```

## Behavioral Targeting Examples

### Cross-Channel Behavior
```typescript
// User watches Career Compass then Future Lab
if (viewHistory.includes("career-compass") && currentChannel === "future-lab") {
  showAd("Cuba Technologies", "We noticed you're interested in both career growth and tech innovation. Let's talk!");
}

// User frequently watches Wellness Wave in morning
if (morningViewCount("wellness-wave") > 3) {
  showAd("FitFlex Gym", "Make it official! Student memberships 50% off");
}
```

### Interaction-Based Targeting
```typescript
// High poll participation in Mind Feed
if (channel === "mind-feed" && pollParticipation > 0.8) {
  showAd("PrimeZoom", "Engaged learner discount: 20% off all textbooks");
}

// Frequent reactions during Phoenix Sports
if (channel === "phoenix-sports" && reactionRate > 10) {
  showAd("Outwest Steakhouse", "True fans eat meat! Show your ticket for 15% off");
}
```

### Sequential Targeting
```typescript
const adSequence = {
  "world-explorer": [
    { time: 0, ad: "PrimeZoom", message: "Travel essentials" },
    { time: 50, ad: "CampusCash", message: "Save for your trip" },
    { time: 90, ad: "Cuba Technologies", message: "Work from anywhere" }
  ]
};
```

## Demo Scenarios

### Scenario 1: The Ambitious Student
**Journey**: Career Compass → Future Lab → Mind Feed
**Ads Shown**: Cuba Technologies (3x different messages), CampusCash
**Result**: "This student is career-focused with tech interests"

### Scenario 2: The Balanced Student  
**Journey**: Wellness Wave (morning) → Campus Pulse → Study Break (evening)
**Ads Shown**: FitFlex Gym, HungryHawk, BrainrotGG
**Result**: "Health-conscious student who balances work and play"

### Scenario 3: The Explorer
**Journey**: World Explorer → Mind Feed → Future Lab
**Ads Shown**: PrimeZoom, Cuba Technologies, CampusCash
**Result**: "Curious student with global interests and innovation mindset"

## Metrics to Show Judges

### Channel Performance
- **Highest Engagement**: Phoenix Sports (emoji reactions)
- **Best Ad CTR**: Career Compass (Cuba Technologies)
- **Longest Watch Time**: Mind Feed (documentaries)
- **Most Interactive**: The Study Break (polls)

### Targeting Accuracy
- Show how ads change based on:
  - Channel switching patterns
  - Time of day
  - Interaction history
  - Content completion rates

This demonstrates the platform's ability to deliver highly targeted, contextual advertising based on real behavioral data rather than demographics.