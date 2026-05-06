import { NotFoundError } from "@/server/errors/client.error"
import { nicheRepository } from "@/server/repositories/niche.repository"
import { ApiBaseController } from "./api-base.controller"

export type NicheBasic = { id: string; title: string; slug: string }

export class NicheAwareController extends ApiBaseController {
  protected async resolveNiche(slug: string): Promise<NicheBasic> {
    const niche = await nicheRepository.findBySlug(slug)
    if (!niche) throw new NotFoundError("Niche not found")
    return { id: niche.id, title: niche.title, slug: niche.slug }
  }
}
