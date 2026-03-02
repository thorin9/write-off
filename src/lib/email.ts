const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL = 'Write-Off <noreply@writeoff.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://writeoff.app'

type EmailPayload = {
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!RESEND_API_KEY || RESEND_API_KEY === 'placeholder') {
    console.log('[email] RESEND_API_KEY not set, skipping send:', payload.subject, '→', payload.to)
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    })
    return res.ok
  } catch (err) {
    console.error('[email] send failed:', err)
    return false
  }
}

export async function sendMonthlyReminder(
  email: string,
  name: string,
  month: string,
  year: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `📋 Time to log your ${month} expenses — Write-Off`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:16px">
        <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px">Write-Off</h1>
        <h2 style="color:#f1f5f9;font-size:20px;margin-bottom:16px">Time to log your ${month} expenses</h2>
        <p style="color:#94a3b8;margin-bottom:24px">
          Hi ${name || 'there'}, don't let your ${month} deductions slip through the cracks.
          Upload your bank statement or add expenses manually to stay on top of your ${year} taxes.
        </p>
        <a href="${APP_URL}/dashboard/upload" style="display:inline-block;background:#22c55e;color:#0a0f1e;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">
          Upload Statement →
        </a>
        <p style="color:#475569;font-size:12px;margin-top:32px">
          You're receiving this because you have a Write-Off account. 
          <a href="${APP_URL}/dashboard/settings" style="color:#22c55e">Manage notifications</a>
        </p>
      </div>
    `,
  })
}

export async function sendQuarterlyTaxReminder(
  email: string,
  name: string,
  deadline: string,
  quarter: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `⚠️ Quarterly tax deadline: ${deadline} — Write-Off`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:16px">
        <h1 style="color:#22c55e;font-size:24px;margin-bottom:8px">Write-Off</h1>
        <h2 style="color:#f1f5f9;font-size:20px;margin-bottom:16px">📅 ${quarter} Estimated Tax Due: ${deadline}</h2>
        <p style="color:#94a3b8;margin-bottom:16px">
          Hi ${name || 'there'}, your ${quarter} estimated tax payment is due on <strong style="color:#f1f5f9">${deadline}</strong>.
        </p>
        <p style="color:#94a3b8;margin-bottom:24px">
          Review your year-to-date deductions to make sure you're not overpaying.
        </p>
        <a href="${APP_URL}/dashboard/reports" style="display:inline-block;background:#22c55e;color:#0a0f1e;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none">
          View Tax Summary →
        </a>
        <div style="background:#1e293b;border-radius:8px;padding:16px;margin-top:24px">
          <p style="color:#f1f5f9;font-weight:600;margin-bottom:8px">2024 Estimated Tax Deadlines</p>
          <p style="color:#94a3b8;font-size:13px">Q1: April 15 · Q2: June 15 · Q3: September 15 · Q4: January 15</p>
        </div>
        <p style="color:#475569;font-size:12px;margin-top:24px">
          <a href="${APP_URL}/dashboard/settings" style="color:#22c55e">Manage notifications</a>
        </p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Welcome to Write-Off — Let's find your deductions 💚`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0f1e;color:#f1f5f9;padding:32px;border-radius:16px">
        <h1 style="color:#22c55e;font-size:28px;font-weight:800;margin-bottom:8px">Write-Off</h1>
        <p style="color:#94a3b8;margin-bottom:24px">AI-powered tax deductions for 1099 workers</p>
        <h2 style="color:#f1f5f9;font-size:20px;margin-bottom:16px">Welcome, ${name || 'there'}! 🎉</h2>
        <p style="color:#94a3b8;margin-bottom:16px">
          You're now set up to track and maximize your 1099 deductions. Here's how to get started:
        </p>
        <ol style="color:#94a3b8;padding-left:20px;line-height:2">
          <li><strong style="color:#f1f5f9">Upload a bank statement</strong> — We'll parse it and find deductible expenses</li>
          <li><strong style="color:#f1f5f9">Run AI analysis</strong> — GPT-4o classifies every expense by IRS rules</li>
          <li><strong style="color:#f1f5f9">Export your report</strong> — PDF summary ready for your CPA</li>
        </ol>
        <br>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#22c55e;color:#0a0f1e;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none">
          Go to Dashboard →
        </a>
      </div>
    `,
  })
}
