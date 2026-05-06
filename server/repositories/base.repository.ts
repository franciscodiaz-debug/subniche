
type PrismaDelegate<TEntity, TCreate, TUpdate> = {
  findMany(args?: { orderBy?: object }): Promise<TEntity[]>
  findUnique(args: { where: { id: string } }): Promise<TEntity | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findFirst(args: any ): Promise<TEntity | null>
  create(args: { data: TCreate }): Promise<TEntity>
  update(args: { where: { id: string }; data: TUpdate }): Promise<TEntity>
  delete(args: { where: { id: string } }): Promise<TEntity>
}

export class BaseRepository<TEntity, TCreate, TUpdate> {
  constructor(
    private readonly delegate: PrismaDelegate<TEntity, TCreate, TUpdate>,
    private readonly sortBy: string = "created_at",
    private readonly sortOrder: "asc" | "desc" = "desc"
  ) {}

  findAll(): Promise<TEntity[]> {
    return this.delegate.findMany({ orderBy: { [this.sortBy]: this.sortOrder } })
  }

  findById(id: string): Promise<TEntity | null> {
    return this.delegate.findUnique({ where: { id } })
  }

  create(input: TCreate): Promise<TEntity> {
    return this.delegate.create({ data: input })
  }

  update(id: string, input: TUpdate): Promise<TEntity> {
    return this.delegate.update({ where: { id }, data: input })
  }

  delete(id: string): Promise<TEntity> {
    return this.delegate.delete({ where: { id } })
  }

  getModel(): PrismaDelegate<TEntity, TCreate, TUpdate> {
    return this.delegate
  }
}

export type PrismaClientDelegate<TEntity, TCreate, TUpdate> = PrismaDelegate<TEntity, TCreate, TUpdate>
