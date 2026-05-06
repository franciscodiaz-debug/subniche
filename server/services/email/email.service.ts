export interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Abstract base class for email sending.
 * Concrete providers (SendGrid, SES, Resend, etc.) must extend this class
 * and implement the `send` method.
 *
 * Common email templates (e.g. sendVerificationEmail) live here so all
 * providers inherit them without duplication — Open/Closed Principle.
 */
export abstract class EmailService {
  /**
   * Low-level send — implemented by each concrete provider.
   * Providers must NOT be instantiated directly; use a factory or DI container
   * to inject the active provider (Dependency Inversion Principle).
   */
  abstract send(payload: EmailPayload): Promise<void>

  async sendVerificationEmail(email: string, token: string, baseUrl: string): Promise<void> {
    const link = `${baseUrl}/register/complete?token=${token}`

    await this.send({
      to: email,
      subject: "Verify your email address",
      html: `
        <h2>Verify your email</h2>
        <p>Click the link below to confirm your email address. This link expires in 15 minutes.</p>
        <a href="${link}">${link}</a>
      `,
      text: `Verify your email: ${link}`,
    })
  }
}
