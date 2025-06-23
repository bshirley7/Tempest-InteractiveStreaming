# Convex Bandwidth Optimization Fixes

## Problem
The TV Guide was consuming 11.53 GB of bandwidth through excessive `content.getSchedule` queries due to re-renders.

## Root Causes Identified
1. **Unmemoized Date calculations**: Schedule start/end times were recalculated on every render
2. **Unmemoized time blocks**: Window start and time blocks were recreated on every render
3. **Unmemoized channel calculations**: Channel lists were recalculated on every render
4. **CurrentTimeIndicator**: Creating new Date objects on every render

## Fixes Applied

### 1. Memoized Schedule Times (TVGuide.tsx)
```typescript
// BEFORE - Created new dates on every render
const now = new Date()
const scheduleStartTime = new Date(now)
scheduleStartTime.setHours(now.getHours(), 0, 0, 0)

// AFTER - Memoized with useMemo
const { scheduleStartTime, scheduleEndTime } = useMemo(() => {
  const now = new Date()
  const start = new Date(now)
  start.setHours(now.getHours(), 0, 0, 0)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return {
    scheduleStartTime: start.getTime(),
    scheduleEndTime: end.getTime()
  }
}, []) // Empty deps - only calculate once
```

### 2. Memoized Time Blocks (TVGuide.tsx)
```typescript
// BEFORE - Recalculated on every render
const windowStart = new Date(currentDateTime)
const timeBlocks: Date[] = []

// AFTER - Memoized with smart dependency
const { windowStart, timeBlocks } = useMemo(() => {
  // ... calculation logic
}, [Math.floor(currentTime.getMinutes() / 30)]) // Only recalc every 30 mins
```

### 3. Memoized Channel Lists (TVGuide.tsx)
```typescript
// BEFORE
const allChannels = getAllChannels()
const categorizedChannels = getCategorizedChannels()

// AFTER
const allChannels = useMemo(() => getAllChannels(), [channelGroups])
const categorizedChannels = useMemo(() => getCategorizedChannels(), [channelGroups, viewMode, favorites])
```

### 4. Fixed CurrentTimeIndicator
- Moved time string calculation into useEffect
- Update only when position updates (every 30 seconds)

### 5. Fixed useUser Hook Hydration
- Added isClient check to prevent SSR issues
- Deferred localStorage access until client-side

## Best Practices Going Forward

1. **Always memoize expensive calculations** in components that might re-render
2. **Be careful with Date objects** - they create new instances and break React's equality checks
3. **Use `useMemo` for**:
   - Date calculations
   - Array transformations
   - Object creation that depends on props/state
4. **Monitor Convex bandwidth** regularly
5. **Test with React DevTools Profiler** to catch unnecessary re-renders

## Prevention Checklist
- [ ] Are all Date calculations memoized?
- [ ] Are useQuery parameters stable between renders?
- [ ] Are array/object transformations memoized?
- [ ] Do components avoid creating new objects/arrays in render?
- [ ] Are dependencies arrays minimal and necessary?