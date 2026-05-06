export abstract class BaseError extends Error {
  public status: number

  constructor(message: string = "Internal Server Error", status: number = 500) {
    super(message)
    this.name = "BaseError"
    this.status = status
    Object.setPrototypeOf(this, BaseError.prototype)
  }
}