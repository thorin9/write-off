'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Loader2, Bell, User, CreditCard } from 'lucide-react'
import { OCCUPATIONS, TAX_BRACKETS } from '@/lib/utils'

type UserProfile = {
  name: string | null
  email: string
  occupation: string | null
  taxBracket: string | null
  planType: string
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    name: '',
    occupation: '',
    taxBracket: '',
  })

  useEffect(() => {
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile(d.user)
          setForm({
            name: d.user.name || '',
            occupation: d.user.occupation || '',
            taxBracket: d.user.taxBracket || '',
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-green-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Profile</h2>
            <p className="text-slate-500 text-xs">{profile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Occupation / Work Type</label>
            <select
              value={form.occupation}
              onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select occupation…</option>
              {OCCUPATIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            <p className="text-slate-500 text-xs mt-1">
              Used to personalize AI deduction suggestions
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Estimated Tax Bracket</label>
            <select
              value={form.taxBracket}
              onChange={(e) => setForm((p) => ({ ...p, taxBracket: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select bracket…</option>
              {TAX_BRACKETS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <p className="text-slate-500 text-xs mt-1">
              Used to calculate estimated tax savings on your reports
            </p>
          </div>

          <button
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : null}
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            <Bell className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-white font-semibold">Notifications</h2>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Monthly expense upload reminders', sub: 'Reminder to log expenses at month-end' },
            { label: 'Quarterly tax deadline alerts', sub: 'April 15, June 15, Sept 15, Jan 15' },
            { label: 'AI analysis complete', sub: 'When batch analysis finishes' },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800 cursor-pointer group">
              <div>
                <p className="text-white text-sm font-medium">{item.label}</p>
                <p className="text-slate-500 text-xs">{item.sub}</p>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-slate-700 peer-checked:bg-green-500 rounded-full transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Plan */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-slate-400" />
          </div>
          <h2 className="text-white font-semibold">Plan</h2>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-4 ${
          profile?.planType === 'pro'
            ? 'bg-green-950 text-green-400 border border-green-800'
            : 'bg-slate-800 text-slate-300'
        }`}>
          {profile?.planType === 'pro' ? '⭐ Pro Plan' : '🆓 Free Plan'}
        </div>

        {profile?.planType !== 'pro' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-green-950/40 to-slate-900 border border-green-900/40 rounded-xl p-4">
              <p className="text-white font-semibold mb-1">Upgrade to Pro — $12/month</p>
              <ul className="text-slate-300 text-sm space-y-1 mb-4">
                <li>✅ Unlimited expenses (free: 50/month)</li>
                <li>✅ PDF & CSV export</li>
                <li>✅ SMS expense tracking via Twilio</li>
                <li>✅ Priority AI analysis</li>
              </ul>
              <a
                href="/api/stripe/checkout"
                className="inline-block bg-green-500 hover:bg-green-400 text-slate-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
              >
                Upgrade to Pro →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
