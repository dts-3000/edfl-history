import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, query, where, getDocs, deleteDoc } from "firebase/firestore"

// Firebase config - using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function import1930SeasonData() {
  try {
    console.log("🔥 Starting 1930 season data import...")

    // Fetch the CSV data from the provided URL
    const csvUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Book3-Mo8hvw5R5dmGW28NTAYyNpSYdHUH5J.csv"
    console.log("📥 Fetching CSV data from:", csvUrl)

    const response = await fetch(csvUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
    }

    const csvText = await response.text()
    console.log("✅ CSV data fetched successfully")
    console.log("📊 CSV preview:", csvText.substring(0, 200) + "...")

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    console.log("📋 Headers found:", headers)
    console.log("📈 Total lines (including header):", lines.length)

    // Clear existing 1930 season data first
    console.log("🧹 Clearing existing 1930 season data...")
    const existingQuery = query(collection(db, "historicalMatches"), where("season", "==", 1930))
    const existingSnapshot = await getDocs(existingQuery)

    const deletePromises = existingSnapshot.docs.map((doc) => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    console.log(`🗑️ Deleted ${existingSnapshot.docs.length} existing 1930 matches`)

    // Process each data row
    const matches = []
    let successCount = 0
    let errorCount = 0

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))

        if (values.length < headers.length) {
          console.log(`⚠️ Skipping line ${i + 1}: insufficient columns`)
          continue
        }

        // Map CSV columns to match data structure
        const matchData = {
          season: Number.parseInt(values[0]) || 1930,
          date: values[1] || "",
          round: values[2] || "",
          team1: values[3] || "",
          goals1: Number.parseInt(values[4]) || 0,
          behinds1: Number.parseInt(values[5]) || 0,
          points1: Number.parseInt(values[6]) || 0,
          team2: values[7] || "",
          goals2: Number.parseInt(values[8]) || 0,
          behinds2: Number.parseInt(values[9]) || 0,
          points2: Number.parseInt(values[10]) || 0,
          ground: values[11] || "Unknown Ground",
          time: values[12] || "",
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // Validate the match data
        if (!matchData.team1 || !matchData.team2) {
          console.log(`⚠️ Skipping line ${i + 1}: missing team names`)
          errorCount++
          continue
        }

        // Verify points calculation (Goals × 6 + Behinds)
        const calculatedPoints1 = matchData.goals1 * 6 + matchData.behinds1
        const calculatedPoints2 = matchData.goals2 * 6 + matchData.behinds2

        if (matchData.points1 !== calculatedPoints1) {
          console.log(
            `⚠️ Points mismatch for ${matchData.team1}: expected ${calculatedPoints1}, got ${matchData.points1}`,
          )
          matchData.points1 = calculatedPoints1 // Use calculated value
        }

        if (matchData.points2 !== calculatedPoints2) {
          console.log(
            `⚠️ Points mismatch for ${matchData.team2}: expected ${calculatedPoints2}, got ${matchData.points2}`,
          )
          matchData.points2 = calculatedPoints2 // Use calculated value
        }

        matches.push(matchData)
        console.log(
          `✅ Processed: ${matchData.team1} ${matchData.goals1}.${matchData.behinds1} (${matchData.points1}) vs ${matchData.team2} ${matchData.goals2}.${matchData.behinds2} (${matchData.points2})`,
        )
        successCount++
      } catch (error) {
        console.error(`❌ Error processing line ${i + 1}:`, error.message)
        errorCount++
      }
    }

    console.log(`\n📊 Processing Summary:`)
    console.log(`✅ Successfully processed: ${successCount} matches`)
    console.log(`❌ Errors encountered: ${errorCount} matches`)

    // Save all matches to Firebase
    console.log("\n💾 Saving matches to Firebase...")
    let savedCount = 0

    for (const match of matches) {
      try {
        await addDoc(collection(db, "historicalMatches"), match)
        savedCount++

        if (savedCount % 5 === 0) {
          console.log(`💾 Saved ${savedCount}/${matches.length} matches...`)
        }
      } catch (error) {
        console.error("❌ Error saving match:", error.message)
        console.error("Match data:", match)
      }
    }

    console.log(`\n🎉 Import completed successfully!`)
    console.log(`📊 Final Summary:`)
    console.log(`- Total matches processed: ${successCount}`)
    console.log(`- Total matches saved: ${savedCount}`)
    console.log(`- Season: 1930`)

    // Display some statistics
    const teams = [...new Set([...matches.map((m) => m.team1), ...matches.map((m) => m.team2)])]
    const rounds = [...new Set(matches.map((m) => m.round))]

    console.log(`\n📈 Season Statistics:`)
    console.log(`- Teams: ${teams.length}`)
    console.log(`- Rounds: ${rounds.length}`)
    console.log(`- Team list: ${teams.sort().join(", ")}`)
    console.log(`- Round list: ${rounds.sort().join(", ")}`)

    // Find highest scoring match
    const highestScoringMatch = matches.reduce((highest, current) => {
      const currentTotal = current.points1 + current.points2
      const highestTotal = highest.points1 + highest.points2
      return currentTotal > highestTotal ? current : highest
    })

    console.log(`\n🏆 Highest Scoring Match:`)
    console.log(
      `${highestScoringMatch.team1} ${highestScoringMatch.goals1}.${highestScoringMatch.behinds1} (${highestScoringMatch.points1}) vs ${highestScoringMatch.team2} ${highestScoringMatch.goals2}.${highestScoringMatch.behinds2} (${highestScoringMatch.points2})`,
    )
    console.log(`Total: ${highestScoringMatch.points1 + highestScoringMatch.points2} points`)
    console.log(`Round: ${highestScoringMatch.round}, Date: ${highestScoringMatch.date}`)
  } catch (error) {
    console.error("💥 Fatal error during import:", error)
    throw error
  }
}

// Run the import
import1930SeasonData()
  .then(() => {
    console.log("🎯 Script completed successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Script failed:", error)
    process.exit(1)
  })
