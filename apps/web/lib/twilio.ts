import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const fromNumber = process.env.TWILIO_FROM_NUMBER! // ex: +33XXXXXXXXX
const fromWhatsApp = process.env.TWILIO_WHATSAPP_FROM! // ex: whatsapp:+14155238886

function getClient() {
  return twilio(accountSid, authToken)
}

export async function sendSms(to: string, body: string) {
  const client = getClient()
  return client.messages.create({
    to,
    from: fromNumber,
    body,
  })
}

export async function sendWhatsApp(to: string, body: string) {
  const client = getClient()
  // Twilio WhatsApp nécessite le préfixe "whatsapp:"
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`
  return client.messages.create({
    to: toFormatted,
    from: fromWhatsApp,
    body,
  })
}

export async function sendEmail(to: string, subject: string, body: string) {
  // Twilio SendGrid (optionnel) — à implémenter si SENDGRID_API_KEY configuré
  // Pour le moment, log côté serveur
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`)
  console.log(body)
  // TODO: intégrer Twilio SendGrid ou Resend
}

// Message SMS candidat
export function buildCandidateSmsMessage(missionTitle: string, agencyName: string): string {
  return `Bonjour ! ${agencyName} vous propose une mission : "${missionTitle}". Êtes-vous disponible ? Répondez OUI ou NON.`
}

// Message WhatsApp candidat
export function buildCandidateWhatsAppMessage(missionTitle: string, agencyName: string): string {
  return `👋 Bonjour !\n\n*${agencyName}* vous propose une nouvelle mission :\n\n📋 *${missionTitle}*\n\nÊtes-vous disponible et intéressé(e) ?\nRépondez *OUI* ou *NON*.`
}
