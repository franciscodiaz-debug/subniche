import { z } from "zod"
import type { Location as PrismaLocation } from ".prisma/client"
import type { Decimal } from "@prisma/client/runtime/library"

export const locationPublicSchema = z.object({
  country:      z.string(),
  country_code: z.string(),
  state:        z.string(),
  state_code:   z.string(),
  capital:      z.string(),
  city:         z.string(),
  city_code:    z.string(),
  zip_code:     z.string(),
  latitude:     z.number(),
  longitude:    z.number(),
})

export type LocationPublic = z.infer<typeof locationPublicSchema>

export class Location implements PrismaLocation {
  id: string
  country: string
  country_code: string
  state: string
  state_code: string
  capital: string
  city: string
  city_code: string
  zip_code: string
  latitude: Decimal
  longitude: Decimal
  created_at: Date
  updated_at: Date

  constructor(data: PrismaLocation) {
    this.id = data.id
    this.country = data.country
    this.country_code = data.country_code
    this.state = data.state
    this.state_code = data.state_code
    this.capital = data.capital
    this.city = data.city
    this.city_code = data.city_code
    this.zip_code = data.zip_code
    this.latitude = data.latitude
    this.longitude = data.longitude
    this.created_at = data.created_at
    this.updated_at = data.updated_at
  }
}

export type LocationResponse = Omit<Location, "created_at" | "updated_at">
