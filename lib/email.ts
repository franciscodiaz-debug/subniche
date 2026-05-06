/**
 * Email service bootstrap.
 *
 * Imported as a side-effect once (when the auth controller module loads).
 * - Production: RESEND_API_KEY + RESEND_FROM_EMAIL must be set.
 * - Development: if either variable is missing the service stays null;
 *   verification tokens are stored in the DB and printed to stdout so
 *   developers can complete the flow without a real email account.
 */
import { authService } from "@/server/services/auth.service"
import { ResendEmailService } from "@/server/services/email/providers/resend.provider"
import { getLogger } from "@/server/utils/logger"

const apiKey   = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL

if (apiKey && fromEmail) {
  authService.setEmailService(new ResendEmailService(apiKey, fromEmail))
} else {
  const missing = [
    !apiKey    && "RESEND_API_KEY",
    !fromEmail && "RESEND_FROM_EMAIL",
  ].filter(Boolean).join(", ")

  if (process.env.NODE_ENV === "production") {
    getLogger().error(`[email] Missing env vars: ${missing}. Emails will NOT be sent in production!`)
  } else {
    getLogger().info(`[email] ${missing} not set — running in dev mode. Tokens are stored in DB; no emails will be sent.`)
  }
}
