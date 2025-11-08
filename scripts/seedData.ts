/**
 * Seed Firebase Realtime Database with Fake Data
 *
 * This script generates fake user entries and adds them to Firebase
 * to test the animated masonry display with continuous data flow.
 *
 * Usage:
 *   npm run seed           # Add 100 entries with 500ms delay
 *   npm run seed:fast      # Add 100 entries with 100ms delay
 *   npm run seed:slow      # Add 100 entries with 2000ms delay
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";
import { faker } from "@faker-js/faker";

// Image sources for variety
type ImageSourceFunction =
  | ((seed: number) => string)
  | ((name: string) => string);

const IMAGE_SOURCES: ImageSourceFunction[] = [
  // Picsum Photos - High quality random images
  (seed: number) => `https://picsum.photos/seed/${seed}/600/800`,
  (seed: number) => `https://picsum.photos/seed/${seed}/600/600`,
  (seed: number) => `https://picsum.photos/seed/${seed}/800/600`,

  // Lorem Flickr - Themed images
  (seed: number) => `https://loremflickr.com/600/800/person?random=${seed}`,
  (seed: number) => `https://loremflickr.com/600/600/face?random=${seed}`,

  // UI Avatars - Generated avatars with names
  (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=600&background=random&bold=true&length=2`,

  // Pravatar - Random avatars
  (seed: number) => `https://i.pravatar.cc/600?img=${(seed % 70) + 1}`,
];

// Configuration
interface SeedConfig {
  totalEntries: number;
  delayMs: number;
  clearExisting: boolean;
}

const defaultConfig: SeedConfig = {
  totalEntries: 100,
  delayMs: 500, // 500ms between each entry
  clearExisting: false, // Set to true to clear existing data first
};

/**
 * Generate a fake user entry
 */
function generateFakeUser(index: number): {
  name: string;
  imageURL: string;
  wantsToSee: boolean;
  timestamp: number;
} {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;

  // Use different image sources for variety
  const sourceIndex = index % IMAGE_SOURCES.length;
  const imageSource = IMAGE_SOURCES[sourceIndex];

  // Generate image URL based on source type
  let imageURL: string;
  if (sourceIndex === IMAGE_SOURCES.length - 2) {
    // UI Avatars - use name
    imageURL = (imageSource as (name: string) => string)(fullName);
  } else {
    // Other sources - use seed/index
    const seed = faker.number.int({ min: 1000, max: 9999 }) + index;
    imageURL = (imageSource as (seed: number) => string)(seed);
  }

  // Generate random wantsToSee value (90% true, 10% false for realistic data)
  const wantsToSee = faker.datatype.boolean({ probability: 0.9 });

  // Generate timestamp (spread over last 30 days)
  const daysAgo = faker.number.int({ min: 0, max: 30 });
  const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000 + index * 1000;

  return {
    name: fullName,
    imageURL,
    wantsToSee,
    timestamp,
  };
}

/**
 * Add a single entry to Firebase
 */
async function addEntry(
  entry: ReturnType<typeof generateFakeUser>,
): Promise<void> {
  const usersRef = ref(db, "users");
  const newUserRef = push(usersRef);
  await set(newUserRef, entry);
}

/**
 * Clear all existing data (optional)
 */
async function clearData(): Promise<void> {
  const usersRef = ref(db, "users");
  await set(usersRef, null);
  console.log("✅ Cleared existing data");
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main seeding function
 */
async function seedData(config: SeedConfig): Promise<void> {
  console.log("\n🌱 Starting Firebase Data Seeding...\n");
  console.log(`📊 Configuration:`);
  console.log(`   - Total Entries: ${config.totalEntries}`);
  console.log(`   - Delay Between Entries: ${config.delayMs}ms`);
  console.log(`   - Clear Existing: ${config.clearExisting}`);
  console.log(
    `   - Total Duration: ~${((config.totalEntries * config.delayMs) / 1000).toFixed(1)}s\n`,
  );

  try {
    // Clear existing data if requested
    if (config.clearExisting) {
      await clearData();
      await sleep(1000);
    }

    // Add entries one by one
    for (let i = 0; i < config.totalEntries; i++) {
      const entry = generateFakeUser(i);

      await addEntry(entry);

      // Progress indicator
      const progress = (((i + 1) / config.totalEntries) * 100).toFixed(1);
      const bar = "█".repeat(Math.floor(((i + 1) / config.totalEntries) * 40));
      const empty = "░".repeat(
        40 - Math.floor(((i + 1) / config.totalEntries) * 40),
      );

      process.stdout.write(
        `\r[${bar}${empty}] ${progress}% | ${i + 1}/${config.totalEntries} | ${entry.name}`,
      );

      // Wait before next entry (simulate continuous data flow)
      if (i < config.totalEntries - 1) {
        await sleep(config.delayMs);
      }
    }

    console.log("\n\n✅ Seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Total entries added: ${config.totalEntries}`);
    console.log(
      `   - Time taken: ${((config.totalEntries * config.delayMs) / 1000).toFixed(1)}s`,
    );
    console.log(
      `\n🎨 Open http://localhost:3000/display to see the animation!\n`,
    );

    process.exit(0);
  } catch (error) {
    console.error("\n\n❌ Error seeding data:", error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): SeedConfig {
  const args = process.argv.slice(2);

  // Check for help first, before initializing anything
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
📦 Firebase Data Seeding Script

Usage:
  npm run seed                    # Default: 100 entries, 500ms delay
  npm run seed:fast               # 100 entries, 100ms delay
  npm run seed:slow               # 100 entries, 2000ms delay

Options:
  -c, --count <number>            Number of entries to create (default: 100)
  -d, --delay <number>            Delay in ms between entries (default: 500)
  --clear                         Clear existing data before seeding
  --fast                          Quick seeding (100ms delay)
  --slow                          Slow seeding (2000ms delay)
  -h, --help                      Show this help message

Examples:
  npm run seed -- -c 50 -d 1000   # 50 entries, 1 second delay
  npm run seed -- --clear -c 200  # Clear data, add 200 entries
  npm run seed:fast -- --clear    # Clear data, fast seeding

🎨 Make sure to open http://localhost:3000/display to watch the animation!
    `);
    process.exit(0);
  }

  const config = { ...defaultConfig };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--count":
      case "-c":
        config.totalEntries = parseInt(args[++i], 10) || 100;
        break;
      case "--delay":
      case "-d":
        config.delayMs = parseInt(args[++i], 10) || 500;
        break;
      case "--clear":
        config.clearExisting = true;
        break;
      case "--fast":
        config.delayMs = 100;
        break;
      case "--slow":
        config.delayMs = 2000;
        break;
    }
  }

  return config;
}

// Parse arguments first (handles --help without needing Firebase)
const config = parseArgs();

// Firebase configuration (same as your client config)
const firebaseConfig = {
  apiKey: "AIzaSyC-_SCz-grIMTleA9cdN081XulAr99ksDY",
  authDomain: "bb-qr-e95b0.firebaseapp.com",
  databaseURL:
    "https://bb-qr-e95b0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bb-qr-e95b0",
  storageBucket: "bb-qr-e95b0.firebasestorage.app",
  messagingSenderId: "890878428207",
  appId: "1:890878428207:web:89c2e6122604871b8c72da",
};

// Check for required environment variables
if (!firebaseConfig.databaseURL) {
  console.error(
    "❌ Error: NEXT_PUBLIC_FIREBASE_DATABASE_URL is not set in .env.local",
  );
  console.error(
    "\nMake sure your .env.local file contains all Firebase configuration variables:",
  );
  console.error("  NEXT_PUBLIC_FIREBASE_API_KEY=...");
  console.error("  NEXT_PUBLIC_FIREBASE_DATABASE_URL=...");
  console.error("  etc.\n");
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Run the script
seedData(config);
