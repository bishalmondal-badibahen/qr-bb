# Display Page & Masonry Layout Guide 🎨

## Overview

The new display system includes:
1. **Display Page** (`/display`) - Full-screen masonry layout with auto-scroll
2. **Masonry View** - Admin page masonry toggle
3. **Auto-scroll functionality** - Automatically scrolls when content reaches viewport height

---

## 🎯 Features

### Display Page (`/display`)

A dedicated full-screen display page perfect for:
- **Digital signage** - Show entries on a monitor/TV
- **Public displays** - Events, exhibitions, galleries
- **Real-time walls** - Live social walls, photo walls

**Key Features:**
- ✨ Beautiful masonry grid layout
- 🔄 Real-time updates from Firebase
- 📱 Fully responsive (1-5 columns based on screen size)
- 🎭 Animated entry transitions
- 🎨 Hover effects with color shifts
- 🔄 Auto-scroll when new data reaches viewport height
- 🌙 Dark theme optimized

### Masonry Layout

Uses GSAP-powered masonry grid with:
- **Responsive columns**: 1-5 based on screen width
- **Random heights**: Creates Pinterest-style layout
- **Smooth animations**: Items fade in from bottom
- **Hover interactions**: Scale, color shift effects
- **Blur-to-focus**: Images fade in with blur effect

---

## 🚀 Usage

### Accessing the Display Page

#### Option 1: Direct URL
```
http://localhost:3000/display
```

#### Option 2: From Admin Page
Click the **"Open Display Page"** button in the header

#### Option 3: For Production
```
https://yourdomain.com/display
```

### Switching Views on Admin Page

Use the toggle buttons:
- **List View** - Traditional card-based list
- **Masonry View** - Pinterest-style grid

---

## 🎨 Auto-Scroll Behavior

The display page automatically scrolls when:

1. **New entries are added** to Firebase
2. **Content reaches viewport height**
3. **Scroll position exceeds one viewport**

### How it works:

```typescript
// When near bottom (< 100px)
→ Smooth scroll to bottom to show new content

// When scrolled past viewport height
→ Smooth scroll to top to loop content

// Prevents scroll conflicts
→ Disables during animation (1 second)
```

### Customizing Auto-Scroll

Edit `app/display/page.tsx`:

```typescript
const checkAndAutoScroll = () => {
  // Adjust the threshold (default: 100px from bottom)
  if (scrollPosition + containerHeight >= contentHeight - 100) {
    // Near bottom logic
  }
  
  // Adjust viewport multiplier (default: 1x viewport)
  else if (scrollPosition >= containerHeight) {
    // Loop to top logic
  }
};
```

---

## 📐 Masonry Configuration

### Column Breakpoints

Defined in `Masonry.tsx`:

```typescript
const columns = useMedia(
  [
    "(min-width:1500px)",  // 5 columns
    "(min-width:1000px)",  // 4 columns
    "(min-width:600px)",   // 3 columns
    "(min-width:400px)",   // 2 columns
  ],
  [5, 4, 3, 2],
  1  // Default: 1 column
);
```

### Animation Options

Customize in `MasonryLiveList.tsx` or `app/display/page.tsx`:

```typescript
<Masonry
  items={masonryItems}
  ease="power3.out"              // GSAP easing
  duration={0.6}                 // Animation duration
  stagger={0.04}                 // Delay between items
  animateFrom="bottom"           // Entry direction
  scaleOnHover={true}            // Scale effect
  hoverScale={1.05}              // Scale amount
  blurToFocus={true}             // Blur fade-in
  colorShiftOnHover={true}       // Color overlay on hover
/>
```

### Animation Direction Options

- `"bottom"` - Items slide up (default)
- `"top"` - Items slide down
- `"left"` - Items slide from left
- `"right"` - Items slide from right
- `"center"` - Items expand from center
- `"random"` - Random directions

---

## 🎯 Image Handling

### With User Images

If `imageURL` exists from S3:
```typescript
img: user.imageURL
```

### Fallback Avatars

Uses UI Avatars API for users without images:
```typescript
img: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=400&background=random&bold=true`
```

### Random Heights

Creates masonry effect:
```typescript
height: Math.floor(Math.random() * 200) + 300  // 300-500px
```

**Customize height range:**
```typescript
// Taller images (500-700px)
height: Math.floor(Math.random() * 200) + 500

// Shorter images (200-400px)
height: Math.floor(Math.random() * 200) + 200
```

---

## 🎨 Styling

### Display Page Theme

Dark theme optimized:
```css
bg-gradient-to-br from-gray-900 via-gray-800 to-black
```

### Glass Effect Header

Translucent sticky header:
```typescript
className="glass backdrop-blur-xl border-b border-white/10"
```

### Custom Scrollbar

Thin primary-colored scrollbar:
```css
.scrollbar-thin
.scrollbar-track-gray-800
.scrollbar-thumb-primary/50
```

---

## 🔧 Customization Guide

### Change Column Count

Edit `Masonry.tsx`:
```typescript
// More columns on desktop
[6, 5, 4, 3],  // Up to 6 columns

// Fewer columns
[3, 2, 1, 1],  // Max 3 columns
```

### Adjust Gap Between Items

Edit `Masonry.tsx`:
```typescript
const gap = 16;  // Change to 8, 12, 20, 24, etc.
```

### Disable Auto-Scroll

Comment out in `app/display/page.tsx`:
```typescript
// if (previousCountRef.current > 0 && userArray.length > previousCountRef.current) {
//   checkAndAutoScroll();
// }
```

### Change Scroll Speed

Adjust animation duration:
```typescript
container.scrollTo({
  top: contentHeight,
  behavior: "smooth",  // or "auto" for instant
});
```

---

## 📱 Responsive Behavior

### Mobile (< 400px)
- 1 column
- Larger touch targets
- Simplified animations

### Tablet (400-1000px)
- 2-3 columns
- Optimized spacing
- Full hover effects

### Desktop (> 1000px)
- 4-5 columns
- Advanced animations
- Color shift effects

---

## 🎭 Performance Tips

### Large Datasets

For 100+ entries:

1. **Implement pagination**
```typescript
const ITEMS_PER_PAGE = 50;
const displayedUsers = users.slice(0, ITEMS_PER_PAGE);
```

2. **Lazy load images**
```typescript
<img loading="lazy" ... />
```

3. **Optimize Firebase query**
```typescript
query(ref(db, "users"), limitToLast(100))
```

### Reduce Animation Lag

```typescript
// Lower stagger delay
stagger={0.02}  // instead of 0.04

// Disable blur effect
blurToFocus={false}

// Reduce duration
duration={0.4}  // instead of 0.6
```

---

## 🔗 URLs & Routes

### Available Routes

```
/              → Admin page (form + list/masonry toggle)
/display       → Full-screen display page
```

### Deep Linking

```bash
# Open display page in new tab
http://localhost:3000/display

# For digital signage, use kiosk mode:
http://localhost:3000/display?fullscreen=true
```

---

## 🎯 Use Cases

### 1. Event Photo Wall
- Guests upload photos via form
- Display page shows live masonry wall
- Auto-scrolls as new photos arrive

### 2. Conference Check-in
- Attendees register with photo
- Display shows everyone checked in
- Creates social engagement

### 3. Gallery Exhibition
- Artists upload work
- Public display page for visitors
- Beautiful masonry presentation

### 4. Social Media Wall
- Real-time submissions
- Auto-scrolling display
- Engagement tracking

---

## 🛠️ Troubleshooting

### Images Not Loading

**Check:**
1. S3 bucket permissions (see `QUICK_FIX_IMAGES.md`)
2. CORS configuration
3. `next.config.ts` remote patterns

### Masonry Not Animating

**Solutions:**
1. Ensure GSAP is installed: `npm install gsap`
2. Check browser console for errors
3. Verify items have unique IDs

### Auto-Scroll Not Working

**Debug:**
1. Check container has `ref={containerRef}`
2. Verify overflow: `overflow-y-auto`
3. Check scroll height > viewport height

### Performance Issues

**Optimize:**
1. Limit Firebase query results
2. Reduce animation stagger
3. Disable color shift on hover
4. Use smaller image sizes

---

## 📊 Technical Details

### Dependencies

```json
{
  "gsap": "^3.x",              // Animations
  "firebase": "^10.x",         // Realtime database
  "lucide-react": "^0.x",      // Icons
  "next": "16.x",              // Framework
  "react": "^19.x"             // UI library
}
```

### Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ IE11 (not supported)

### Recommended Display

- **Resolution**: 1920x1080 or higher
- **Aspect Ratio**: 16:9 or 16:10
- **Orientation**: Landscape (portrait supported)

---

## 🎨 Advanced Customization

### Add Name Overlay on Images

Edit `Masonry.tsx`:
```typescript
<div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
  <p className="text-white font-semibold">{item.name}</p>
</div>
```

### Add Click Actions

```typescript
onClick={() => {
  // Open lightbox
  // Show details modal
  // Navigate to profile
  window.open(item.url, "_blank");
}}
```

### Custom Transitions

```typescript
// Bounce effect
ease="back.out(1.7)"

// Elastic effect
ease="elastic.out(1, 0.3)"

// Smooth ease
ease="power2.inOut"
```

---

## 📝 Summary

✅ **Display page at** `/display`  
✅ **Masonry view toggle** on admin page  
✅ **Auto-scroll** when content reaches viewport  
✅ **Real-time updates** from Firebase  
✅ **Responsive** 1-5 columns  
✅ **Animated** with GSAP  
✅ **Customizable** animations and layout  

Perfect for live displays, events, and digital signage! 🎉