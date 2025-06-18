import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Club, ClubHistorySection, VFLAFLPlayer, ClubRecordHolder, BestPlayer } from "@/types"

// Collection reference
const clubsCollection = collection(db, "clubs")

// Get all clubs
export async function getClubs(): Promise<Club[]> {
  try {
    const querySnapshot = await getDocs(query(clubsCollection, orderBy("name")))
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as Club,
    )
  } catch (error) {
    console.error("Error fetching clubs:", error)
    throw new Error("Failed to fetch clubs")
  }
}

// Get club by ID
export async function getClub(id: string): Promise<Club | null> {
  try {
    const docRef = doc(clubsCollection, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Club
    }
    return null
  } catch (error) {
    console.error("Error fetching club:", error)
    throw new Error("Failed to fetch club")
  }
}

// Get club by slug
export async function getClubBySlug(slug: string): Promise<Club | null> {
  try {
    const q = query(clubsCollection, where("slug", "==", slug))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data(),
      } as Club
    }
    return null
  } catch (error) {
    console.error("Error fetching club by slug:", error)
    throw new Error("Failed to fetch club")
  }
}

// Add new club
export async function addClub(clubData: Omit<Club, "id">): Promise<string> {
  try {
    const docRef = await addDoc(clubsCollection, {
      ...clubData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding club:", error)
    throw new Error("Failed to add club")
  }
}

// Update club
export async function updateClub(id: string, clubData: Partial<Club>): Promise<void> {
  try {
    const docRef = doc(clubsCollection, id)
    await updateDoc(docRef, {
      ...clubData,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating club:", error)
    throw new Error("Failed to update club")
  }
}

// Delete club
export async function deleteClub(id: string): Promise<void> {
  try {
    const docRef = doc(clubsCollection, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting club:", error)
    throw new Error("Failed to delete club")
  }
}

// Get club records (premierships, best & fairest, articles)
export async function getClubRecords(clubId: string) {
  try {
    // Get premierships
    const premiershipsRef = collection(db, "clubs", clubId, "premierships")
    const premiershipsSnap = await getDocs(query(premiershipsRef, orderBy("year", "desc")))
    const premierships = premiershipsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // Get best & fairest
    const bestAndFairestRef = collection(db, "clubs", clubId, "bestAndFairest")
    const bestAndFairestSnap = await getDocs(query(bestAndFairestRef, orderBy("year", "desc")))
    const bestAndFairest = bestAndFairestSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    // Get articles
    const articlesRef = collection(db, "clubs", clubId, "articles")
    const articlesSnap = await getDocs(query(articlesRef, orderBy("year", "desc")))
    const articles = articlesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return {
      premierships,
      bestAndFairest,
      articles,
    }
  } catch (error) {
    console.error("Error fetching club records:", error)
    throw new Error("Failed to fetch club records")
  }
}

// Club History Sections
export async function getClubHistorySections(clubId: string): Promise<ClubHistorySection[]> {
  try {
    const sectionsRef = collection(db, "clubs", clubId, "historySections")
    const sectionsSnap = await getDocs(query(sectionsRef, orderBy("order")))
    return sectionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ClubHistorySection[]
  } catch (error) {
    console.error("Error fetching club history sections:", error)
    throw new Error("Failed to fetch club history sections")
  }
}

export async function addClubHistorySection(clubId: string, section: Omit<ClubHistorySection, "id">): Promise<string> {
  try {
    const sectionsRef = collection(db, "clubs", clubId, "historySections")
    const docRef = await addDoc(sectionsRef, {
      ...section,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding club history section:", error)
    throw new Error("Failed to add club history section")
  }
}

export async function updateClubHistorySection(
  clubId: string,
  sectionId: string,
  section: Partial<ClubHistorySection>,
): Promise<void> {
  try {
    const sectionRef = doc(db, "clubs", clubId, "historySections", sectionId)
    await updateDoc(sectionRef, {
      ...section,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating club history section:", error)
    throw new Error("Failed to update club history section")
  }
}

export async function deleteClubHistorySection(clubId: string, sectionId: string): Promise<void> {
  try {
    const sectionRef = doc(db, "clubs", clubId, "historySections", sectionId)
    await deleteDoc(sectionRef)
  } catch (error) {
    console.error("Error deleting club history section:", error)
    throw new Error("Failed to delete club history section")
  }
}

// VFL/AFL Players
export async function getVFLAFLPlayers(clubId: string): Promise<VFLAFLPlayer[]> {
  try {
    const playersRef = collection(db, "clubs", clubId, "vflAflPlayers")
    const playersSnap = await getDocs(query(playersRef, orderBy("name")))
    return playersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as VFLAFLPlayer[]
  } catch (error) {
    console.error("Error fetching VFL/AFL players:", error)
    throw new Error("Failed to fetch VFL/AFL players")
  }
}

export async function addVFLAFLPlayer(clubId: string, player: Omit<VFLAFLPlayer, "id">): Promise<string> {
  try {
    const playersRef = collection(db, "clubs", clubId, "vflAflPlayers")
    const docRef = await addDoc(playersRef, {
      ...player,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding VFL/AFL player:", error)
    throw new Error("Failed to add VFL/AFL player")
  }
}

export async function updateVFLAFLPlayer(
  clubId: string,
  playerId: string,
  player: Partial<VFLAFLPlayer>,
): Promise<void> {
  try {
    const playerRef = doc(db, "clubs", clubId, "vflAflPlayers", playerId)
    await updateDoc(playerRef, {
      ...player,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating VFL/AFL player:", error)
    throw new Error("Failed to update VFL/AFL player")
  }
}

export async function deleteVFLAFLPlayer(clubId: string, playerId: string): Promise<void> {
  try {
    const playerRef = doc(db, "clubs", clubId, "vflAflPlayers", playerId)
    await deleteDoc(playerRef)
  } catch (error) {
    console.error("Error deleting VFL/AFL player:", error)
    throw new Error("Failed to delete VFL/AFL player")
  }
}

// Club Record Holders
export async function getClubRecordHolders(clubId: string): Promise<ClubRecordHolder[]> {
  try {
    const recordsRef = collection(db, "clubs", clubId, "recordHolders")
    const recordsSnap = await getDocs(query(recordsRef, orderBy("category")))
    return recordsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ClubRecordHolder[]
  } catch (error) {
    console.error("Error fetching club record holders:", error)
    throw new Error("Failed to fetch club record holders")
  }
}

export async function addClubRecordHolder(clubId: string, record: Omit<ClubRecordHolder, "id">): Promise<string> {
  try {
    const recordsRef = collection(db, "clubs", clubId, "recordHolders")
    const docRef = await addDoc(recordsRef, {
      ...record,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding club record holder:", error)
    throw new Error("Failed to add club record holder")
  }
}

export async function updateClubRecordHolder(
  clubId: string,
  recordId: string,
  record: Partial<ClubRecordHolder>,
): Promise<void> {
  try {
    const recordRef = doc(db, "clubs", clubId, "recordHolders", recordId)
    await updateDoc(recordRef, {
      ...record,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating club record holder:", error)
    throw new Error("Failed to update club record holder")
  }
}

export async function deleteClubRecordHolder(clubId: string, recordId: string): Promise<void> {
  try {
    const recordRef = doc(db, "clubs", clubId, "recordHolders", recordId)
    await deleteDoc(recordRef)
  } catch (error) {
    console.error("Error deleting club record holder:", error)
    throw new Error("Failed to delete club record holder")
  }
}

// Best Players
export async function getBestPlayers(clubId: string): Promise<BestPlayer[]> {
  try {
    const playersRef = collection(db, "clubs", clubId, "bestPlayers")
    const playersSnap = await getDocs(query(playersRef, orderBy("name")))
    return playersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as BestPlayer[]
  } catch (error) {
    console.error("Error fetching best players:", error)
    throw new Error("Failed to fetch best players")
  }
}

export async function addBestPlayer(clubId: string, player: Omit<BestPlayer, "id">): Promise<string> {
  try {
    const playersRef = collection(db, "clubs", clubId, "bestPlayers")
    const docRef = await addDoc(playersRef, {
      ...player,
      createdAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error adding best player:", error)
    throw new Error("Failed to add best player")
  }
}

export async function updateBestPlayer(clubId: string, playerId: string, player: Partial<BestPlayer>): Promise<void> {
  try {
    const playerRef = doc(db, "clubs", clubId, "bestPlayers", playerId)
    await updateDoc(playerRef, {
      ...player,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error updating best player:", error)
    throw new Error("Failed to update best player")
  }
}

export async function deleteBestPlayer(clubId: string, playerId: string): Promise<void> {
  try {
    const playerRef = doc(db, "clubs", clubId, "bestPlayers", playerId)
    await deleteDoc(playerRef)
  } catch (error) {
    console.error("Error deleting best player:", error)
    throw new Error("Failed to delete best player")
  }
}

// Add premiership record
export async function addPremiership(clubId: string, premiership: any) {
  try {
    const premiershipsRef = collection(db, "clubs", clubId, "premierships")
    await addDoc(premiershipsRef, {
      ...premiership,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error adding premiership:", error)
    throw new Error("Failed to add premiership")
  }
}

// Add best & fairest record
export async function addBestAndFairest(clubId: string, award: any) {
  try {
    const bestAndFairestRef = collection(db, "clubs", clubId, "bestAndFairest")
    await addDoc(bestAndFairestRef, {
      ...award,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error adding best & fairest:", error)
    throw new Error("Failed to add best & fairest")
  }
}

// Add article record
export async function addArticle(clubId: string, article: any) {
  try {
    const articlesRef = collection(db, "clubs", clubId, "articles")
    await addDoc(articlesRef, {
      ...article,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error("Error adding article:", error)
    throw new Error("Failed to add article")
  }
}

// Delete record from subcollection
export async function deleteRecord(clubId: string, collection: string, recordId: string) {
  try {
    const recordRef = doc(db, "clubs", clubId, collection, recordId)
    await deleteDoc(recordRef)
  } catch (error) {
    console.error("Error deleting record:", error)
    throw new Error("Failed to delete record")
  }
}
