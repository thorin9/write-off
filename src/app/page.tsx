import Link from 'next/link'

const WHO_ITS_FOR = [
  { emoji: '🚗', title: 'Rideshare & Delivery', names: 'Uber · Lyft · DoorDash · Instacart' },
  { emoji: '💻', title: 'Freelancers & Devs', names: 'Designers · Engineers · Writers' },
  { emoji: '🏡', title: 'Real Estate Agents', names: 'Brokers · Property Managers' },
  { emoji: '📱', title: 'Content Creators', names: 'YouTubers · Influencers · Podcasters' },
  { emoji: '📋', title: 'Consultants', names: 'Coaches · Therapists · Advisors' },
  { emoji: '🔨', title: 'Contractors & Trades', names: 'Handymen · Electricians · Plumbers' },
]

const DEDUCTIONS = [
  { label: 'Mileage & Gas', icon: '⛽' },
  { label: 'Home Office', icon: '🏠' },
  { label: 'Phone & Internet', icon: '📱' },
  { label: 'Software & Apps', icon: '💾' },
  { label: 'Meals (50%)', icon: '🍽️' },
  { label: 'Equipment', icon: '🖥️' },
  { label: 'Marketing', icon: '📣' },
  { label: 'Professional Fees', icon: '📄' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">

      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Write-<span className="text-green-400">Off</span></span>
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
              For 1099 Workers
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm transition">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="bg-green-500 hover:bg-green-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-lg transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">

        {/* Who it's for — RIGHT at the top */}
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2.5 text-green-300 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Built exclusively for 1099 contractors & self-employed workers
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-[1.05] tracking-tight">
          You Work 1099.<br />
          <span className="text-green-400">Keep More of It.</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-4 leading-relaxed">
          The IRS lets you deduct hundreds of expenses — mileage, your phone, software,
          home office, meals. Most 1099 workers miss half of them.
        </p>
        <p className="text-lg text-slate-300 font-medium max-w-xl mx-auto mb-10">
          Write-Off uses AI to find every deduction you&apos;re legally owed —
          without a $400/hr accountant.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
          <Link
            href="/auth/signup"
            className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-green-500/20"
          >
            Find My Deductions Free →
          </Link>
          <Link
            href="/auth/login"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-slate-500 text-sm">No accountant needed · No credit card · 5 min setup</p>
      </section>

      {/* WHO IT'S FOR — Big visible niche section */}
      <section className="border-y border-slate-800 bg-slate-900/40 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-slate-400 text-sm uppercase tracking-widest font-medium mb-8">
            Built for people who get a 1099 — not a W-2
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {WHO_ITS_FOR.map((item) => (
              <div
                key={item.title}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center hover:border-green-800 transition"
              >
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-white font-semibold text-sm mb-1">{item.title}</div>
                <div className="text-slate-500 text-xs leading-snug">{item.names}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Pain Point */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
          Being 1099 means the IRS expects{' '}
          <span className="text-red-400">you</span>{' '}
          to track your own deductions.
        </h2>
        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
          No employer doing it for you. No HR department handing you a tax form.
          Just you, a pile of receipts, and a tax code that changes every year.
          The average 1099 worker leaves <strong className="text-white">$6,000–$12,000</strong> in
          deductions unclaimed every year — not because they&apos;re cheating, but because
          they didn&apos;t know they could claim it.
        </p>

        {/* Deduction grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {DEDUCTIONS.map((d) => (
            <div
              key={d.label}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-left"
            >
              <span className="text-xl">{d.icon}</span>
              <span className="text-slate-200 text-sm font-medium">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="text-green-400 font-semibold text-lg">
          Write-Off finds all of these for you. Automatically.
        </p>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/40 py-14">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-extrabold text-green-400">$9,400</div>
            <div className="text-slate-400 text-sm mt-2">Average additional deductions found per 1099 filer</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white">2 min</div>
            <div className="text-slate-400 text-sm mt-2">To upload a bank statement and get AI results</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-white">IRS §535</div>
            <div className="text-slate-400 text-sm mt-2">Every verdict cites the actual IRS publication</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Write-<span className="text-green-400">Off</span> Works
          </h2>
          <p className="text-slate-400 text-lg">Three steps. No accountant required.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              emoji: '📤',
              title: 'Upload Your Expenses',
              desc: 'Drop in your bank statement PDF, CSV export, or snap a receipt photo. We parse it all automatically — Chase, BofA, Mercury, Wells Fargo, all formats.',
            },
            {
              step: '02',
              emoji: '🤖',
              title: 'AI Classifies Every Line',
              desc: 'Our AI reads IRS Publication 535 so you don\'t have to. Every expense gets a verdict: ✅ Deductible · 🟡 Likely · ⚠️ Partial · 🔴 Not Deductible — with an explanation.',
            },
            {
              step: '03',
              emoji: '📊',
              title: 'Download Your Tax Report',
              desc: 'Get a clean Schedule C breakdown, ready for your accountant or your own filing. Every deduction documented, every IRS rule cited.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative"
            >
              <span className="absolute top-6 right-6 text-slate-700 font-bold text-2xl">{item.step}</span>
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
                <span className="text-2xl">{item.emoji}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial-style callout */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { quote: '"I had no idea I could deduct my Adobe subscription and half my phone bill. Write-Off found $2,800 I almost missed."', name: 'Freelance designer, Chicago' },
            { quote: '"As a DoorDash driver, mileage tracking was always a mess. Now I just upload my bank statement and it\'s done."', name: 'Delivery driver, Austin TX' },
            { quote: '"I was paying $400 to my accountant just to organize my receipts. Write-Off does it in two minutes."', name: 'Real estate agent, Miami' },
          ].map((t) => (
            <div key={t.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">{t.quote}</p>
              <p className="text-green-400 text-xs font-medium">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SMS Feature callout */}
      <section className="border-t border-slate-800 bg-slate-900/40 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Text an expense. Get a verdict in seconds.
          </h2>
          <p className="text-slate-400 text-lg mb-6">
            Just paid for something and not sure if it&apos;s deductible? Text it to your Write-Off number.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-sm mx-auto text-left font-mono text-sm space-y-3">
            <div className="flex justify-end">
              <span className="bg-green-500 text-slate-900 px-3 py-2 rounded-2xl rounded-br-sm">
                $84 at Staples for printer paper
              </span>
            </div>
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-200 px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%]">
                ✅ <strong>DEDUCTIBLE</strong> (92% confidence)<br />
                <span className="text-slate-400 text-xs">Office Supplies · IRS Pub. 535 §7</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-4">Available on Pro plan</p>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Simple pricing. No surprises.</h2>
          <p className="text-slate-400">Less than one hour of a CPA&apos;s time — for a whole year of deductions.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <p className="text-slate-400 text-sm font-medium mb-1">Free</p>
            <p className="text-4xl font-bold text-white mb-4">$0</p>
            <ul className="text-slate-300 text-sm space-y-2 mb-6">
              {['50 expenses/month', 'AI analysis', 'AI tax chat', 'Dashboard & charts'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block w-full text-center border border-slate-700 hover:border-slate-500 text-white py-3 rounded-lg text-sm transition">
              Get Started Free
            </Link>
          </div>
          <div className="bg-gradient-to-b from-green-950/60 to-slate-900 border border-green-700 rounded-2xl p-8 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
            <p className="text-green-400 text-sm font-medium mb-1">Pro</p>
            <p className="text-4xl font-bold text-white mb-1">$12<span className="text-slate-400 text-lg font-normal">/mo</span></p>
            <p className="text-slate-400 text-xs mb-4">vs. $400+/hr for a CPA</p>
            <ul className="text-slate-300 text-sm space-y-2 mb-6">
              {['Unlimited expenses', 'PDF + CSV export', 'SMS expense tracking', 'Priority AI analysis', 'Quarterly tax reminders'].map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block w-full text-center bg-green-500 hover:bg-green-400 text-slate-900 font-bold py-3 rounded-lg text-sm transition">
              Start Free, Upgrade Anytime
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-green-950 to-slate-900 border-t border-green-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-green-400 font-semibold text-sm uppercase tracking-widest mb-4">For every 1099 worker</p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Stop guessing.<br />Start writing off.
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
            If you got a 1099 this year, the IRS wants you to track your deductions.
            Write-Off makes sure you don&apos;t miss a single one.
          </p>
          <Link
            href="/auth/signup"
            className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-10 py-4 rounded-xl text-lg inline-block transition shadow-xl shadow-green-500/20"
          >
            Find My Deductions Free →
          </Link>
          <p className="text-slate-500 text-sm mt-4">No credit card · Cancel anytime · 5 min to first result</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white">Write-<span className="text-green-400">Off</span></span>
            <span className="text-slate-600 mx-3">·</span>
            <span className="text-slate-500 text-sm">AI tax deductions for 1099 workers</span>
          </div>
          <div className="text-slate-600 text-xs text-center md:text-right">
            Not tax advice. Consult a qualified CPA for your specific situation.
            <br />© {new Date().getFullYear()} Write-Off
          </div>
        </div>
      </footer>
    </div>
  )
}
