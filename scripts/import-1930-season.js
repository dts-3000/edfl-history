import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore"

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function import1930Season() {
  try {
    console.log("🏈 Starting 1930 Season Import...")

    // Check if 1930 data already exists
    const existingQuery = query(collection(db, "historicalMatches"), where("season", "==", 1930))
    const existingSnapshot = await getDocs(existingQuery)

    if (existingSnapshot.size > 0) {
      console.log(`⚠️  Found ${existingSnapshot.size} existing 1930 matches. Skipping import.`)
      console.log("💡 Delete existing 1930 data first if you want to re-import.")
      return
    }

    // Fetch the CSV data
    console.log("📥 Fetching CSV data...")
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Book3-J0EAYHiI726mzd2z7e41QRsKDwJACd.csv",
    )
    const csvText = await response.text()

    // Parse CSV
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📊 CSV Headers:", headers)
    console.log(`📈 Found ${lines.length - 1} data rows`)

    const matches = []
    let successCount = 0
    let errorCount = 0

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length < 11) {
          console.log(`⚠️  Skipping row ${i}: insufficient data`)
          errorCount++
          continue
        }

        // Map CSV columns to our format
        const match = {
          season: 1930,
          date: values[0] || "", // Date
          round: values[2] || "", // Round
          team1: values[3] || "", // TeamA
          team1Score: `${values[4] || "0"}.${values[5] || "0"}`, // GoalsA.BehindsA
          points1: Number.parseInt(values[6]) || 0, // PointsA
          team2: values[7] || "", // TeamB
          team2Score: `${values[8] || "0"}.${values[9] || "0"}`, // GoalsB.BehindsB
          points2: Number.parseInt(values[10]) || 0, // PointsB
          ground: "Unknown", // Not in CSV, will need to be added manually
          time: "", // Not in CSV
          notes: `Imported from 1930 season data`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        matches.push(match)
        successCount++

        // Log sample matches
        if (i <= 3) {
          console.log(`📋 Sample Match ${i}:`, {
            date: match.date,
            round: match.round,
            match: `${match.team1} ${match.team1Score} (${match.points1}) vs ${match.team2} ${match.team2Score} (${match.points2})`,
          })
        }
      } catch (error) {
        console.error(`❌ Error processing row ${i}:`, error)
        errorCount++
      }
    }

    console.log(`\n📊 Processing Summary:`)
    console.log(`✅ Successfully processed: ${successCount} matches`)
    console.log(`❌ Errors: ${errorCount} rows`)

    if (matches.length === 0) {
      console.log("❌ No valid matches to import")
      return
    }

    // Save to Firebase
    console.log("\n💾 Saving to Firebase...")
    let savedCount = 0

    for (const match of matches) {
      try {
        await addDoc(collection(db, "historicalMatches"), match)
        savedCount++

        if (savedCount % 10 === 0) {
          console.log(`💾 Saved ${savedCount}/${matches.length} matches...`)
        }
      } catch (error) {
        console.error("❌ Error saving match:", error)
      }
    }

    console.log(`\n🎉 Import Complete!`)
    console.log(`📊 Total matches imported: ${savedCount}`)
    console.log(`🏆 Season: 1930`)
    console.log(`📅 Date range: ${matches[0]?.date} to ${matches[matches.length - 1]?.date}`)

    // Show unique teams
    const teams = [...new Set([...matches.map((m) => m.team1), ...matches.map((m) => m.team2)])].sort()
    console.log(`🏈 Teams (${teams.length}):`, teams.join(", "))

    // Show unique rounds
    const rounds = [...new Set(matches.map((m) => m.round))].sort()
    console.log(`🏁 Rounds (${rounds.length}):`, rounds.join(", "))
  } catch (error) {
    console.error("❌ Import failed:", error)
  }
}

// Run the import
import1930Season()
