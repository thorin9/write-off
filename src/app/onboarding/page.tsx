'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { OCCUPATIONS, TAX_BRACKETS } from '@/lib/utils'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [occupation, setOccupation] = useState('')
  const [taxBracket, setTaxBracket] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleComplete() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupation, taxBracket }),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      router.push('/dashboard')
    } catch (e) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const progressPercent = ((step - 1) / 2) * 100

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Write-<span className="text-green-400">Off</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Let&apos;s personalize your experience</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-slate-400 mb-2">
            <span>Step {step} of 3</span>
            <span>{step === 3 ? 'Almost done!' : 'Keep going'}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {step === 1 && (
            <div>
              <div className="text-3xl mb-4">💼</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                What&apos;s your occupation?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                This helps us identify the most relevant tax deductions for your work.
              </p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                {OCCUPATIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => setOccupation(occ)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm ${
                      occupation === occ
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {occ}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!occupation}
                className="w-full mt-6 bg-green-500 hover:bg-green-400 text-slate-900 font-semibold rounded-lg px-4 py-3 transition disabled:opacity-40"
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="text-3xl mb-4">💰</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                What&apos;s your estimated tax bracket?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Based on your expected annual income. This helps us estimate your potential
                tax savings.
              </p>
              <div className="space-y-2">
                {TAX_BRACKETS.map((bracket) => (
                  <button
                    key={bracket}
                    onClick={() => setTaxBracket(bracket)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition text-sm ${
                      taxBracket === bracket
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {bracket}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-slate-700 text-slate-300 hover:text-white rounded-lg px-4 py-3 transition text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!taxBracket}
                  className="flex-1 bg-green-500 hover:bg-green-400 text-slate-900 font-semibold rounded-lg px-4 py-3 transition disabled:opacity-40"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="text-3xl mb-4">🎉</div>
              <h2 className="text-xl font-semibold text-white mb-2">
                You&apos;re all set!
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Here&apos;s what we know about you. You can always update this in settings.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
                  <span className="text-slate-400 text-sm">Occupation</span>
                  <span className="text-white text-sm font-medium">{occupation}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800 rounded-lg px-4 py-3">
                  <span className="text-slate-400 text-sm">Tax Bracket</span>
                  <span className="text-white text-sm font-medium">{taxBracket}</span>
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-950 border border-red-900 rounded-lg p-3 mb-4">
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-slate-700 text-slate-300 hover:text-white rounded-lg px-4 py-3 transition text-sm"
                >
                  ← Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-2 flex-grow bg-green-500 hover:bg-green-400 text-slate-900 font-semibold rounded-lg px-4 py-3 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Go to Dashboard →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
