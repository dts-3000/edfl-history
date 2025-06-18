import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore"

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

const sampleHistoricalMatches = [
  {
    season: 1930,
    date: "20/09/1930",
    round: "Final",
    team1: "St Johns",
    team1Score: "15.14",
    points1: 104,
    team2: "Kensington Methodist",
    team2Score: "6.8",
    points2: 44,
    ground: "Holmes Rd Reserve",
    time: "3:00 PM",
  },
  {
    season: 1930,
    date: "13/09/1930",
    round: "Semi Final",
    team1: "St Johns",
    team1Score: "12.10",
    points1: 82,
    team2: "Aberfeldie",
    team2Score: "8.12",
    points2: 60,
    ground: "Windy Hill",
    time: "2:30 PM",
  },
  {
    season: 1930,
    date: "06/09/1930",
    round: "Qualifying Final",
    team1: "Kensington Methodist",
    team1Score: "14.8",
    points1: 92,
    team2: "Essendon District",
    team2Score: "11.15",
    points2: 81,
    ground: "Aberfeldie Park",
    time: "2:30 PM",
  },
  {
    season: 1931,
    date: "19/09/1931",
    round: "Grand Final",
    team1: "Aberfeldie",
    team1Score: "13.11",
    points1: 89,
    team2: "St Johns",
    team2Score: "10.14",
    points2: 74,
    ground: "Windy Hill",
    time: "3:00 PM",
  },
  {
    season: 1931,
    date: "12/09/1931",
    round: "Preliminary Final",
    team1: "St Johns",
    team1Score: "16.9",
    points1: 105,
    team2: "Kensington Methodist",
    team2Score: "9.13",
    points2: 67,
    ground: "Holmes Rd Reserve",
    time: "2:30 PM",
  },
]

async function loadHistoricalData() {
  try {
    console.log("Checking existing historical matches...")

    // Check if data already exists
    const existingMatches = await getDocs(collection(db, "historicalMatches"))

    if (existingMatches.size > 0) {
      console.log(`Found ${existingMatches.size} existing matches. Skipping import.`)
      return
    }

    console.log("Loading sample historical data...")

    for (const match of sampleHistoricalMatches) {
      await addDoc(collection(db, "historicalMatches"), {
        ...match,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log(`Added match: ${match.team1} vs ${match.team2} (${match.season})`)
    }

    console.log(`Successfully loaded ${sampleHistoricalMatches.length} historical matches!`)
  } catch (error) {
    console.error("Error loading historical data:", error)
  }
}

loadHistoricalData()
