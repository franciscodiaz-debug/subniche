import { Resend } from "resend"
import { EmailService, type EmailPayload } from "../email.service"

export class ResendEmailService extends EmailService {
  private readonly resend: Resend

  constructor(
    apiKey: string,
    private readonly fromEmail: string,
  ) {
    super()
    this.resend = new Resend(apiKey)
  }

  async send(payload: EmailPayload): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to:   payload.to,
      subject: payload.subject,
      html: payload.html,
      ...(payload.text ? { text: payload.text } : {}),
    })

    if (error) throw new Error(`Resend: ${error.message}`)
  }
}
