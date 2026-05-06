import { EmailService, type EmailPayload } from "../email.service"

/**
 * SendGrid concrete provider.
 * Install @sendgrid/mail and set SENDGRID_API_KEY + SENDGRID_FROM_EMAIL
 * in your environment variables before enabling this provider.
 */
export class SendGridEmailService extends EmailService {
  async send(_payload: EmailPayload): Promise<void> {
    throw new Error(
      "SendGridEmailService is not yet configured. " +
        "Install @sendgrid/mail, set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL, " +
        "then implement this method."
    )
  }
}
