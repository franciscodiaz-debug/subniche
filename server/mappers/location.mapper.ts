import type { Location as PrismaLocation } from ".prisma/client"
import type { LocationPublic } from "@/server/models/location.model"

export const LocationMapper = {
  toPublic({ country, country_code, state, state_code, capital, city, city_code, zip_code, latitude, longitude }: PrismaLocation): LocationPublic {
    return { country, country_code, state, state_code, capital, city, city_code, zip_code, latitude: Number(latitude), longitude: Number(longitude) }
  },
}
