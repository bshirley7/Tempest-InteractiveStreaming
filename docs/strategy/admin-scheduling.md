# Admin Scheduling Interface

The admin scheduling interface at `/admin/schedule` provides comprehensive tools for managing program schedules across channels.

## Features

### 1. Schedule Management
- **Visual Schedule Grid**: Week view showing programs for each day
- **Drag & Drop**: Rearrange programs within the schedule (coming soon)
- **Real-time Updates**: See changes instantly as you edit

### 2. Auto-Generate Schedules
Two methods for generating schedules:

#### Quick Generate (This Week)
- Automatically fills the current week with available content
- Uses sequential content ordering
- Applies default ad settings

#### Bulk Schedule Generator
- Generate schedules for any date range
- Configure daily programming hours (e.g., 6 AM - 2 AM)
- Choose content ordering:
  - Sequential: Play content in order
  - Random: Shuffle content
  - By Popularity: Most viewed content first
- Customize ad placement:
  - Pre-roll ads (before content)
  - Mid-roll ads (during content, with configurable intervals)
  - Post-roll ads (after content)

### 3. Ad Break Management
- **Automatic Ad Placement**: Based on content duration
  - Pre-roll: 15 seconds default
  - Mid-roll: 30 seconds every 15 minutes for longer content
  - Post-roll: 15 seconds for content over 5 minutes
- **Manual Editing**: Click any program to edit its ad breaks
- **Revenue Estimation**: See projected ad revenue based on placement

### 4. Schedule Analytics
View comprehensive analytics for your scheduled content:
- Total programs and duration
- Ad time percentage
- Content type distribution (Movies vs TV Shows)
- Top genres
- Estimated revenue
- Revenue per hour
- Content variety metrics

### 5. Bulk Operations
- **Copy Schedule**: Duplicate a week's schedule to another week
- **Clear Schedule**: Remove all programs for a time period
- **Bulk Edit**: Update multiple programs at once

## Usage

### Creating a Schedule

1. **Select a Channel**: Choose from the dropdown menu
2. **Navigate to Week**: Use arrow buttons to select the target week
3. **Generate Schedule**: 
   - Click "Bulk Schedule Generator" for full control
   - Or use "Quick Generate" for this week with defaults
4. **Review**: Check the generated schedule in the grid view
5. **Edit**: Click any program to modify ad breaks or timing
6. **Save**: Click "Save Changes" when satisfied

### Editing Programs

Click any program in the schedule to:
- View program details
- Add/remove ad breaks
- Adjust ad duration
- Remove from schedule

### Viewing Analytics

1. Click "Show Analytics" button
2. Review key metrics:
   - Total programs scheduled
   - Total content duration
   - Ad time percentage
   - Revenue projections
3. Use insights to optimize your schedule

## Best Practices

1. **Balance Content**: Mix different genres and content types
2. **Strategic Ad Placement**: 
   - Use shorter pre-rolls to reduce viewer drop-off
   - Place mid-rolls at natural break points
   - Consider viewer experience with ad frequency
3. **Prime Time Programming**: Schedule popular content during peak hours
4. **Regular Updates**: Refresh schedules weekly to keep content fresh

## API Integration

The scheduling system uses these Convex functions:

- `schedule.generateSchedule`: Auto-generate schedules with parameters
- `schedule.saveSchedule`: Save schedule changes
- `schedule.getScheduleAnalytics`: Retrieve analytics data
- `schedule.copySchedule`: Duplicate schedules between weeks

## Technical Details

- Schedules are stored as content entries with `scheduledAt` timestamps
- Ad breaks are stored in content metadata
- Analytics are calculated in real-time based on schedule data
- All times are stored in UTC and displayed in local timezone