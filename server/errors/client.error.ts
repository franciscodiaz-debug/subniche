import { BaseError } from "./base.error"

export class NotFoundError extends BaseError {
  constructor(message: string = "Not found", status: number = 404) {
    super(message, status)
    this.name = "NotFoundError"
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ValidationError extends BaseError {
  constructor(message: string = "Validation error", status: number = 422) {
    super(message, status)
    this.name = "ValidationError"
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class ConflictError extends BaseError {
  constructor(message: string = "Conflict error", status: number = 409) {
    super(message, status)
    this.name = "ConflictError"
    Object.setPrototypeOf(this, ConflictError.prototype)
  }
}