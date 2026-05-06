import { locationRepository } from "@/server/repositories/location.repository"
import { NotFoundError } from "@/server/errors/client.error"
import type { LocationResponse } from "@/server/models/location.model"

class LocationService {
  async getByZipCode(zip_code: string): Promise<LocationResponse> {
    const location = await locationRepository.findByZipCode(zip_code)
    if (!location) throw new NotFoundError("Location not found")
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { created_at: _ca, updated_at: _ua, ...rest } = location
    return rest
  }
}

export const locationService = new LocationService()
