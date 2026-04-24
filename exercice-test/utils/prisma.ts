// utils/prisma.ts
import { PrismaNeon } from "@prisma/adapter-neon"
import { PrismaClient } from "../app/generated/prisma/client"
import dotenv from "dotenv"

dotenv.config()

// 1. Créer l'adaptateur Neon à partir de la DATABASE_URL
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

// 2. Créer le client Prisma branché sur l'adaptateur
const prisma = new PrismaClient({
  adapter,
  log: ["query", "info", "warn", "error"],   // logs verbeux en dev
})

export default prisma