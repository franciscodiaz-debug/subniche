import { prisma } from "@/lib/prisma"
import type { Location } from ".prisma/client"

class LocationRepository {
  findByZipCode(zip_code: string): Promise<Location | null> {
    return prisma.location.findFirst({ where: { zip_code } })
  }
}

export const locationRepository = new LocationRepository()
