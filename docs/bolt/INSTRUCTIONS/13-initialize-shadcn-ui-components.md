# Step 13: Initialize Shadcn/UI Components

## Context
You are building Tempest, an interactive streaming platform. This step initializes shadcn/ui and installs all required UI components that will be used throughout the application.

## Prerequisites
- Step 12 completed successfully
- You are in the `tempest` project directory
- Tailwind CSS configured
- Dependencies installed

## Task
Initialize shadcn/ui with the correct configuration and install all UI components needed for the Tempest platform.

## Exact Commands to Execute

### 1. Initialize Shadcn/UI

```bash
npx shadcn@latest init
```

**When prompted, select these exact options:**
- Would you like to use TypeScript? → **Yes**
- Which style would you like to use? → **Default**
- Which color would you like to use as base color? → **Slate**
- Where is your global CSS file? → **app/globals.css**
- Would you like to use CSS variables for colors? → **Yes**
- Where is your tailwind.config.js located? → **tailwind.config.ts**
- Configure the import alias for components? → **components**
- Configure the import alias for utils? → **lib/utils**

### 2. Install All Required Components (Single Command)

```bash
npx shadcn@latest add button card dialog dropdown-menu input label scroll-area select sheet slider switch tabs badge progress avatar toast alert checkbox form separator accordion alert-dialog command popover calendar table
```

## Components Being Installed

### Core Components
- `button` - Interactive buttons with variants
- `input` - Form input fields
- `label` - Form labels
- `form` - Form wrapper and validation
- `checkbox` - Checkbox inputs

### Layout Components
- `card` - Content containers
- `sheet` - Slide-out panels
- `scroll-area` - Custom scrollable areas
- `separator` - Visual dividers
- `accordion` - Collapsible content

### Navigation Components
- `dropdown-menu` - Context menus
- `tabs` - Tab navigation
- `command` - Command palette
- `popover` - Floating content

### Feedback Components
- `dialog` - Modal dialogs
- `alert-dialog` - Confirmation dialogs
- `toast` - Notification messages
- `alert` - Inline alerts
- `badge` - Status indicators
- `progress` - Progress bars

### Data Components
- `table` - Data tables
- `avatar` - User profile images
- `calendar` - Date picker

### Input Components
- `select` - Dropdown selections
- `slider` - Range inputs
- `switch` - Toggle switches

## Verification Steps

1. Check that shadcn/ui config was created:
   ```bash
   cat components.json
   ```

2. Verify components were installed:
   ```bash
   ls -la components/ui/
   ```

3. Check that all expected components exist:
   ```bash
   ls components/ui/ | wc -l
   ```
   (Should show approximately 24 components)

4. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

## Expected File Structure After Installation

```
components/
├── ui/
│   ├── accordion.tsx
│   ├── alert.tsx
│   ├── alert-dialog.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── checkbox.tsx
│   ├── command.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── slider.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── toast.tsx
│   └── toaster.tsx
```

## Components.json Configuration

The `components.json` file should contain:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "components",
    "utils": "lib/utils"
  }
}
```

## Test Component Installation

Create a test file to verify components work:

### Create `components/test-ui.tsx` (Temporary Test File)

```typescript
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TestUI() {
  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>UI Components Test</CardTitle>
        <CardDescription>Testing shadcn/ui components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-input">Test Input</Label>
          <Input id="test-input" placeholder="Enter text..." />
        </div>
        <div className="flex gap-2">
          <Button>Primary Button</Button>
          <Button variant="outline">Outline Button</Button>
        </div>
        <div className="flex gap-2">
          <Badge>Default Badge</Badge>
          <Badge variant="secondary">Secondary Badge</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Temporarily update `app/page.tsx` to test components

Add this import and component to the homepage to test:

```typescript
// Add this import at the top
import { TestUI } from "@/components/test-ui"

// Add this inside the container, after the feature grid
<div className="mt-16 flex justify-center">
  <TestUI />
</div>
```

## Verification Commands

```bash
# Check if installation was successful
npm run dev
```

Visit http://localhost:3000 and verify:
1. Homepage loads without errors
2. Test UI components render correctly
3. Styling matches the design system

## Success Criteria
- `components.json` file created with correct configuration
- All 24+ UI components installed in `components/ui/`
- TypeScript compilation succeeds
- Test components render correctly on homepage
- No console errors in browser

## Cleanup After Testing

Once verified, remove the test file:
```bash
rm components/test-ui.tsx
```

And remove the test component from `app/page.tsx`.

## Important Notes
- Shadcn/ui components use Radix UI primitives for accessibility
- All components support dark mode automatically
- Components are fully customizable with Tailwind classes
- TypeScript definitions are included for all components

## Next Step
After completing this step, proceed to Step 14: Create Authentication Pages.