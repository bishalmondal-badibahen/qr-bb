# 🌱 Seed Data - Quick Reference

## ⚡ Quick Start (3 Steps)

### 1️⃣ Start Dev Server
```bash
npm run dev
```

### 2️⃣ Open Display Page
```
http://localhost:3000/display
```

### 3️⃣ Run Seed Script
```bash
npm run seed
```

**That's it!** Watch cards appear in real-time! ✨

---

## 📋 Available Commands

| Command | What It Does |
|---------|--------------|
| `npm run seed` | Add 100 entries, 500ms delay (balanced) |
| `npm run seed:fast` | Add 100 entries, 100ms delay (quick) |
| `npm run seed:slow` | Add 100 entries, 2000ms delay (watch closely) |
| `npm run seed:clear` | Clear data first, then add 100 |

---

## 🎛️ Custom Options

```bash
# Custom count
npm run seed -- --count 50

# Custom delay
npm run seed -- --delay 1000

# Clear first
npm run seed -- --clear

# Combine options
npm run seed -- --clear --count 200 --delay 300
```

---

## 🎯 Common Use Cases

### Fill Empty Database
```bash
npm run seed:clear
```

### Quick Test (Fast)
```bash
npm run seed:fast
```

### Watch Animations (Slow)
```bash
npm run seed:slow -- --count 20
```

### Stress Test
```bash
npm run seed:fast -- --count 500
```

---

## 🖼️ What Gets Created

Each entry has:
- **Name**: Fake person name (e.g., "John Doe")
- **Image**: Random image from various sources
- **Timestamp**: Unique timestamp

Image sources:
- ✅ Picsum Photos (high quality)
- ✅ Lorem Flickr (themed)
- ✅ UI Avatars (generated)
- ✅ Pravatar (avatar library)

**All image domains already configured!** ✅

---

## 🔍 Expected Behavior

When running the seed script:
1. Progress bar shows in terminal
2. Display page updates in real-time
3. New cards fade in smoothly
4. Existing animations don't restart
5. Names visible on all cards

---

## ⚠️ Troubleshooting

### Script won't run
```bash
npm install --save-dev tsx @faker-js/faker
```

### Images not loading
1. Restart dev server: `Ctrl+C` then `npm run dev`
2. Hard refresh browser: `Ctrl+Shift+R`

### No data appearing
1. Check `.env.local` has Firebase config
2. Verify Firebase Database rules allow write
3. Check browser console for errors

---

## 🧹 Cleanup

Remove all test data:
```bash
# Via Firebase Console
Go to: Firebase Console → Database → Delete "users" node
```

---

## 💡 Pro Tips

- ✅ Start dev server BEFORE seeding
- ✅ Open display page in browser FIRST
- ✅ Use `--clear` for fresh starts
- ✅ Use `--slow` to watch animations
- ✅ Use `--fast` to fill database quickly

---

## 📊 Timing Reference

| Entries | Delay | Total Time |
|---------|-------|------------|
| 100 | 100ms | ~10s |
| 100 | 500ms | ~50s |
| 100 | 2000ms | ~3m 20s |
| 500 | 100ms | ~50s |
| 1000 | 100ms | ~1m 40s |

---

## 🎨 Full Workflow

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Seed data
npm run seed:clear

# Browser
http://localhost:3000/display
```

**Watch the animated masonry come to life!** 🚀

---

**Need more details?** See `SEED_DATA_GUIDE.md`
