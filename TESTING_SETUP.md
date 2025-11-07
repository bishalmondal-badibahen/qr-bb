# Testing Setup - Animated Masonry with Seed Data

## 🎯 Overview

This guide will help you test the animated masonry display with fake data to see how animations behave when data continuously flows into the system.

---

## 🚀 Quick Start (Copy & Paste)

### Step 1: Start Development Server

```bash
npm run dev
```

Keep this running in Terminal 1.

### Step 2: Open Display Page

Open your browser to:
```
http://localhost:3000/display
```

You should see an empty state (no entries yet).

### Step 3: Run Seed Script (New Terminal)

In Terminal 2:
```bash
npm run seed
```

Watch the magic happen! ✨

---

## 📦 What's Already Configured

✅ **Faker.js installed** - Generates realistic fake names
✅ **TSX installed** - Runs TypeScript files directly
✅ **Image domains configured** - All placeholder image services added to `next.config.ts`
✅ **Seed script ready** - Located at `scripts/seedData.ts`
✅ **NPM commands set up** - Multiple seeding options available

**You don't need to configure anything!** Everything is ready to use.

---

## 🎛️ Seeding Commands

### Basic Commands

| Command | Speed | Use Case |
|---------|-------|----------|
| `npm run seed` | **Medium** (500ms) | Balanced testing |
| `npm run seed:fast` | **Fast** (100ms) | Quick database fill |
| `npm run seed:slow` | **Slow** (2000ms) | Watch each animation |
| `npm run seed:clear` | Medium + Clear | Fresh start |

### Custom Options

```bash
# Seed specific number of entries
npm run seed -- --count 50

# Custom delay between entries
npm run seed -- --delay 1000

# Clear database first, then seed
npm run seed -- --clear

# Combine options
npm run seed:fast -- --clear --count 200
```

---

## 🧪 Testing Scenarios

### Test 1: Initial Population
**Goal:** See empty → filled state transition

```bash
# Terminal 1
npm run dev

# Browser
http://localhost:3000/display
# (Should show "No entries yet")

# Terminal 2
npm run seed
```

**Expected:**
- Empty state disappears
- Columns start animating immediately
- Cards appear one by one
- Each card fades in smoothly
- Names visible on all cards

---

### Test 2: Continuous Flow
**Goal:** Verify smooth real-time updates

```bash
# With display page open, run:
npm run seed
```

**Expected:**
- New cards continuously appear
- Existing animations DON'T restart
- No flickering or jumping
- Smooth 60fps performance
- Names always visible on new cards

---

### Test 3: Fast Influx
**Goal:** Stress test animation system

```bash
npm run seed:fast -- --count 500
```

**Expected:**
- Cards appear rapidly
- Animations stay smooth
- No lag or stutter
- Memory usage stable
- Column scrolling uninterrupted

---

### Test 4: Watch Details
**Goal:** Observe individual animations

```bash
npm run seed:slow -- --count 20
```

**Expected:**
- See each fade-in clearly
- Card distributes across columns
- Hover effects work immediately
- Names readable on all backgrounds
- Gradient overlay always visible

---

## 📊 What Data Gets Created

### Entry Structure

```json
{
  "name": "Emma Wilson",
  "imageURL": "https://picsum.photos/seed/1234/600/800",
  "timestamp": 1738234567890
}
```

### Name Generation
- Uses Faker.js for realistic names
- Format: `FirstName LastName`
- Examples: "John Doe", "Alice Johnson", "Michael Chen"

### Image Sources (Rotates Through)
1. **Picsum Photos** - `https://picsum.photos/...`
2. **Lorem Flickr** - `https://loremflickr.com/...`
3. **UI Avatars** - `https://ui-avatars.com/...`
4. **Pravatar** - `https://i.pravatar.cc/...`

All domains are **already configured** in `next.config.ts`!

### Timestamps
- Spread over last 30 days
- Each entry has unique timestamp
- Display sorts by newest first

---

## 🎨 What to Observe

### Animation Behavior

Watch for these key features:

1. **Immediate Start**
   - ✅ Columns animate from page load
   - ❌ NOT after hover trigger

2. **Alternating Directions**
   - ✅ Even columns (1st, 3rd, 5th) scroll DOWN ⬇️
   - ✅ Odd columns (2nd, 4th, 6th) scroll UP ⬆️

3. **Seamless Looping**
   - ✅ No visible jumps or cuts
   - ✅ Appears as infinite content

4. **New Item Integration**
   - ✅ New cards fade in smoothly
   - ✅ Existing animations continue
   - ✅ No restart or flicker

5. **Name Visibility**
   - ✅ Names always visible (not hover-only)
   - ✅ Dark gradient ensures readability
   - ✅ Date shown below name

6. **Hover Effects**
   - ✅ Card scales up 5%
   - ✅ Colorful overlay appears
   - ✅ Glow ring effect
   - ✅ Column pauses smoothly

### Performance Metrics

Open DevTools → Performance tab:

- **FPS**: Should maintain ~60fps
- **Memory**: Stable (no climbing)
- **CPU**: Low to moderate usage
- **Network**: Only initial Firebase connection

---

## 🖥️ Recommended Setup

### Two Monitor Setup
- **Monitor 1**: Browser with display page fullscreen
- **Monitor 2**: Terminal with seed script + DevTools

### Single Monitor Setup
- **Browser**: Right side (display page)
- **Terminal**: Left side (seed script output)
- **DevTools**: Bottom panel (console/performance)

---

## 📈 Progress Output

While seeding, you'll see:

```
[████████████░░░░░░░░░░░░░░] 32.0% | 32/100 | John Doe
```

- **Progress Bar**: Visual completion
- **Percentage**: 0-100%
- **Count**: Current/Total
- **Name**: Last added entry

After completion:

```
✅ Seeding completed successfully!

📊 Summary:
   - Total entries added: 100
   - Time taken: 50.0s

🎨 Open http://localhost:3000/display to see the animation!
```

---

## 🐛 Troubleshooting

### Problem: Script won't run

**Error:** `tsx: command not found`

**Solution:**
```bash
npm install
```

---

### Problem: Firebase error

**Error:** `FIREBASE_DATABASE_URL is not set`

**Solution:**
1. Check `.env.local` exists in project root
2. Verify it contains:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### Problem: Images not loading

**Error:** Images show broken icon

**Solution:**
1. Restart Next.js dev server:
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

2. Hard refresh browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

---

### Problem: No data appears on display

**Checklist:**
1. ✅ Dev server running? (`npm run dev`)
2. ✅ Display page open? (`/display`)
3. ✅ Seed script ran successfully?
4. ✅ Browser console errors? (F12 → Console)
5. ✅ Firebase rules allow write?

---

### Problem: Animations not starting

**Solutions:**
1. Clear browser cache (hard refresh)
2. Check console for GSAP errors
3. Verify columns are present in DOM
4. Try closing other tabs (memory)

---

## 🧹 Cleanup Test Data

### Method 1: Via Script (Recommended)
```bash
# This will clear all users data
npm run seed:clear
```

### Method 2: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Realtime Database
4. Find "users" node
5. Click ⋮ menu → Delete

---

## 📱 Responsive Testing

Test different screen sizes:

```bash
# Seed some data
npm run seed:fast -- --count 50

# Then resize browser to test:
```

| Width | Columns | Expected |
|-------|---------|----------|
| 375px (Mobile) | 1 | Single column scrolling |
| 768px (Tablet) | 2 | Two columns, opposite directions |
| 1024px (Laptop) | 3 | Three columns alternating |
| 1280px (Desktop) | 4 | Four columns (default) |
| 1920px (Full HD) | 6 | Six columns, more content |

---

## ⏱️ Timing Reference

Plan your testing sessions:

| Entries | Delay | Total Time | Use Case |
|---------|-------|------------|----------|
| 20 | 2000ms | ~40s | Watch each card carefully |
| 50 | 1000ms | ~50s | Demo presentation |
| 100 | 500ms | ~50s | Standard testing |
| 100 | 100ms | ~10s | Quick database fill |
| 500 | 100ms | ~50s | Stress test |
| 1000 | 50ms | ~50s | Heavy load test |

---

## 🎯 Testing Checklist

Use this checklist for thorough testing:

### Initial Load
- [ ] Display page shows empty state
- [ ] No console errors
- [ ] Navbar is hidden on `/display`
- [ ] Background gradient visible

### During Seeding
- [ ] Cards appear in real-time
- [ ] Progress shown in terminal
- [ ] Browser updates live
- [ ] No network errors

### Animations
- [ ] Columns animate immediately
- [ ] Even columns scroll down ⬇️
- [ ] Odd columns scroll up ⬆️
- [ ] Seamless infinite loop
- [ ] No jumps or flickers

### New Items
- [ ] Fade in smoothly (opacity + scale)
- [ ] Existing animations don't restart
- [ ] Distributed across columns
- [ ] Names visible immediately

### Card Design
- [ ] Names always visible (no hover needed)
- [ ] Dark gradient overlay present
- [ ] Date shown below name
- [ ] Text readable on all images
- [ ] High contrast (white text on dark gradient)

### Hover Effects
- [ ] Card scales up 5%
- [ ] Colorful overlay appears
- [ ] Glow ring around card
- [ ] Column pauses smoothly
- [ ] Resumes when mouse leaves

### Performance
- [ ] Maintains ~60fps
- [ ] Memory usage stable
- [ ] CPU usage reasonable
- [ ] No memory leaks over time
- [ ] Smooth with 100+ cards

### Responsive
- [ ] 1 column on mobile
- [ ] 2 columns on tablet
- [ ] 4 columns on desktop
- [ ] 6 columns on large displays
- [ ] Animations work on all sizes

---

## 🚀 Advanced Testing

### Long-Running Display Test

Simulate a production kiosk:

```bash
# 1. Fill with data
npm run seed:fast -- --count 500

# 2. Let display run for hours
# 3. Monitor:
#    - Memory usage (should stay stable)
#    - FPS (should stay ~60)
#    - Animations (should continue smoothly)
```

### Concurrent Updates Test

Simulate multiple users adding data:

```bash
# Terminal 1: Seed slowly
npm run seed:slow

# Terminal 2: While running, seed fast
npm run seed:fast -- --count 50
```

Expected: Both batches integrate smoothly.

---

## 💡 Pro Tips

1. **Start dev server FIRST**
   - Always run `npm run dev` before seeding
   - Allows you to see real-time updates

2. **Open display page BEFORE seeding**
   - See the transition from empty → populated
   - Observe first animation initialization

3. **Use `--clear` for demos**
   - Fresh start every time
   - Consistent demo experience

4. **Watch console for errors**
   - Keep DevTools open
   - Check for Firebase, GSAP, or React errors

5. **Test different speeds**
   - `--slow` for presentations
   - `--fast` for development
   - Default for general testing

---

## 📚 Documentation References

- **Full Seed Guide**: `SEED_DATA_GUIDE.md`
- **Quick Reference**: `SEED_QUICK_START.md`
- **Animation Fixes**: `ANIMATION_FIXES.md`
- **Card Design**: `CARD_DESIGN_GUIDE.md`
- **Verification Guide**: `VERIFY_FIXES.md`

---

## 🎉 Ready to Test!

### Complete Workflow

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Seed data
npm run seed:clear

# Browser: Open display
http://localhost:3000/display

# Watch the animated masonry come alive! ✨
```

---

**Happy Testing!** 🚀

If you encounter any issues not covered here, check the browser console and Firebase console for errors.