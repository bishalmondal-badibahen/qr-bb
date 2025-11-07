# Card Design Guide - Always Visible Names

## Overview

This guide shows the visual design of cards in the animated masonry display with **always-visible names**.

---

## Card Anatomy

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         IMAGE CONTENT               │
│         (Dynamic Height)            │
│                                     │
│         250-400px                   │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Gradient Overlay
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░ │   (black/90 → transparent)
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░ John Doe                        │ ← Name (Always Visible)
│ ░░ Jan 15, 2025                    │ ← Date (Always Visible)
└─────────────────────────────────────┘
```

---

## Design Specifications

### Card Container
- **Border Radius**: `rounded-xl` (12px)
- **Shadow**: `shadow-2xl` (large drop shadow)
- **Overflow**: `overflow-hidden` (clips content to border radius)
- **Height**: Dynamic (250-400px based on timestamp)
- **Gap**: 16px between cards (adjustable)
- **Cursor**: `cursor-pointer`
- **Transform**: `hover:scale-105` (5% scale on hover)

### Image Layer
- **Size**: 100% width × 100% height
- **Object Fit**: `cover` (fills container while maintaining aspect ratio)
- **Loading**: `lazy` (loads as user scrolls)
- **Position**: Base layer (z-index: 0)

### Gradient Overlay (Always Visible)
- **Position**: `absolute inset-0` (covers entire card)
- **Gradient**: `from-black/90 via-black/40 to-transparent`
- **Direction**: Bottom to top (`bg-gradient-to-t`)
- **Purpose**: Ensures text readability over any image
- **Opacity**: Always 100% (not conditional)
- **Pointer Events**: None (doesn't block interaction)

### Name Container
- **Position**: `absolute bottom-0` (anchored at bottom)
- **Padding**: `p-4` (16px all sides)
- **Width**: 100% of card width
- **Z-index**: Above gradient overlay
- **Transition**: `transition-all duration-300` (smooth animations)

### Name Text
- **Color**: `text-white` (100% white)
- **Weight**: `font-bold` (700)
- **Size**: `text-lg` (18px)
- **Shadow**: `drop-shadow-2xl` (extra-large drop shadow for contrast)
- **Always Visible**: Yes

### Date Text
- **Color**: `text-white/70` (70% opacity white)
- **Weight**: Regular (400)
- **Size**: `text-xs` (12px)
- **Shadow**: `drop-shadow-lg` (large drop shadow)
- **Always Visible**: Yes

---

## Hover Effects

### What Happens on Hover

1. **Card Scale** (always active)
   - Scales up to 105% of original size
   - Smooth transition over 300ms
   - Creates depth and focus

2. **Color Overlay** (appears on hover)
   - Gradient: `from-blue-500/20 via-purple-500/20 to-pink-500/20`
   - Direction: Top-left to bottom-right
   - Opacity: 0 → 100%
   - Adds vibrant color wash

3. **Glow Ring** (appears on hover)
   - Ring color: Primary theme color
   - Ring width: 2px
   - Opacity: 0% → 50%
   - Creates halo effect around card

4. **Name/Date** (no change)
   - Names remain visible
   - No sliding or fading
   - Maintains readability

---

## Color Palette

### Text Colors
```css
/* Name */
color: rgba(255, 255, 255, 1.0);  /* white */

/* Date */
color: rgba(255, 255, 255, 0.7);  /* white 70% */
```

### Gradient Overlay
```css
/* Bottom (darkest) */
background: rgba(0, 0, 0, 0.9);  /* black 90% */

/* Middle */
background: rgba(0, 0, 0, 0.4);  /* black 40% */

/* Top (transparent) */
background: rgba(0, 0, 0, 0);    /* fully transparent */
```

### Hover Color Overlay
```css
/* Blue tint */
background: rgba(59, 130, 246, 0.2);  /* blue-500 20% */

/* Purple tint */
background: rgba(168, 85, 247, 0.2);  /* purple-500 20% */

/* Pink tint */
background: rgba(236, 72, 153, 0.2);  /* pink-500 20% */
```

---

## Responsive Behavior

### Card Width by Screen Size

| Screen Width | Columns | Card Width      | Name Font Size |
|--------------|---------|-----------------|----------------|
| 375px        | 1       | 100% - gaps     | 18px (text-lg) |
| 768px        | 2       | 50% - gaps      | 18px (text-lg) |
| 1024px       | 3       | 33.3% - gaps    | 18px (text-lg) |
| 1280px       | 4       | 25% - gaps      | 18px (text-lg) |
| 1536px       | 5       | 20% - gaps      | 18px (text-lg) |
| 1920px+      | 6       | 16.6% - gaps    | 18px (text-lg) |

### Card Height

- **Base Height**: 250px
- **Variable Height**: +0 to +150px (based on timestamp)
- **Formula**: `(timestamp % 150) + 250`
- **Min Height**: 250px
- **Max Height**: 400px
- **Purpose**: Creates natural, varied masonry layout

---

## Contrast & Readability

### WCAG Compliance

**White text on black gradient:**
- Contrast Ratio: ~15:1 (Excellent)
- WCAG AAA compliant ✅
- Readable in all lighting conditions

**Drop Shadow Enhancement:**
- Adds additional depth
- Improves readability on light backgrounds
- Creates separation from image content

---

## Animation States

### State 1: Default (Always Visible)
```
Card: Normal size
Gradient: Visible (black fade)
Name: Visible (white, bold)
Date: Visible (white 70%)
Color Overlay: Hidden
Ring: Hidden
```

### State 2: Hover
```
Card: 105% scale
Gradient: Visible (black fade) ← no change
Name: Visible (white, bold) ← no change
Date: Visible (white 70%) ← no change
Color Overlay: Visible (blue/purple/pink)
Ring: Visible (primary color glow)
```

### State 3: Card Scrolling
```
Card: Smooth vertical movement (GSAP)
Gradient: Always visible
Name: Always visible and moving with card
Date: Always visible and moving with card
Transform: GPU-accelerated (translateY)
```

---

## Layout Examples

### Single Column (Mobile)
```
┌─────────────┐
│             │
│   Image     │
│ John Doe    │
└─────────────┘
┌─────────────┐
│             │
│   Image     │
│ Jane Smith  │
└─────────────┘
```

### Four Columns (Desktop)
```
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ Img│ │ Img│ │ Img│ │ Img│
│Name│ │Name│ │Name│ │Name│
└────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│ Img│ │ Img│ │ Img│ │ Img│
│Name│ │Name│ │Name│ │Name│
└────┘ └────┘ └────┘ └────┘
```

---

## Code Structure

### Card Component Structure
```jsx
<div className="card-container">
  {/* Layer 1: Image (Base) */}
  <img src={item.img} alt={item.name} />
  
  {/* Layer 2: Gradient (Always Visible) */}
  <div className="gradient-overlay" />
  
  {/* Layer 3: Name Container (Always Visible) */}
  <div className="name-container">
    <p className="name">{item.name}</p>
    <p className="date">{date}</p>
  </div>
  
  {/* Layer 4: Color Overlay (Hover Only) */}
  <div className="hover-color-overlay" />
  
  {/* Layer 5: Glow Ring (Hover Only) */}
  <div className="hover-glow-ring" />
</div>
```

---

## Best Practices

### DO ✅
- Keep names short (truncate if needed)
- Use high-contrast text colors
- Maintain consistent padding
- Test on different image backgrounds
- Ensure gradient is dark enough

### DON'T ❌
- Don't hide information behind hover
- Don't use thin font weights (hard to read)
- Don't reduce drop shadows (needed for contrast)
- Don't remove gradient overlay (text won't be readable)
- Don't make text too small (minimum 16px)

---

## Accessibility Features

### Screen Readers
- `alt` text on images includes person's name
- Semantic HTML structure
- Text always in DOM (not hidden)
- Proper contrast ratios

### Keyboard Navigation
- Cards are focusable with keyboard
- Focus visible (ring effect)
- No hover-only information

### Touch Devices
- No hover required to see names
- Large touch targets (entire card)
- Visual feedback on tap (scale effect)

---

## Performance Optimization

### GPU Acceleration
```css
transform: translateY(0);  /* Creates GPU layer */
will-change: transform;    /* Hints browser to optimize */
```

### Image Loading
- Lazy loading prevents loading all images at once
- Progressive rendering as user scrolls
- Smooth animation even with many images

### CSS Transitions
- Hardware-accelerated properties only (transform, opacity)
- Avoid layout thrashing (width, height changes)
- Use transforms instead of position changes

---

## Testing Checklist

- [ ] Names visible on all cards without hover
- [ ] Text readable on light images
- [ ] Text readable on dark images
- [ ] Gradient provides sufficient contrast
- [ ] Date format displays correctly
- [ ] Hover effects work smoothly
- [ ] Touch devices show names
- [ ] Screen readers announce names
- [ ] Cards scale smoothly on hover
- [ ] No text overflow or clipping

---

## Troubleshooting

### Names Not Visible
- Check gradient opacity (should be black/90)
- Verify z-index stacking
- Ensure no `opacity-0` classes
- Check for `translate-y-full` (should be removed)

### Text Hard to Read
- Increase gradient darkness
- Add more drop-shadow
- Use bolder font weight
- Increase text size

### Hover Effects Not Working
- Verify `group` class on container
- Check `group-hover:` prefixes
- Ensure transitions are defined
- Test pointer-events settings

---

**Design Version**: 2.0  
**Last Updated**: January 2025  
**Status**: Production Ready ✅