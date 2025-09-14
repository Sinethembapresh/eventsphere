import clientPromise from "../mongodb"
import type { Db, Collection } from "mongodb"

let db: Db

export async function getDatabase(): Promise<Db> {
  if (!db) {
    const client = await clientPromise
    db = client.db("eventsphere")
  }
  return db
}

export async function getUsersCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("users")
}

export async function getEventsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("events")
}

export async function getRegistrationsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("registrations")
}

export async function getFeedbackCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("feedback")
}

export async function getNotificationsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("notifications")
}

export async function getMediaCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("media")
}

export async function getCertificatesCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("certificates")
}

export async function getCertificateTemplatesCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("certificateTemplates")
}

export async function getCertificateVerificationsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("certificateVerifications")
}

export async function getAnalyticsCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("analytics")
}

export async function getGalleryCollection(): Promise<Collection> {
  const database = await getDatabase()
  return database.collection("gallery")
}
