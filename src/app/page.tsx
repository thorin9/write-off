import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Write-<span className="text-green-400">Off</span>
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-slate-400 hover:text-white text-sm transition"
            >
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
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 text-green-400 text-sm mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Powered by GPT-4
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Stop Leaving Money
          <br />
          <span className="text-green-400">on the Table</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Write-Off automatically analyzes your expenses and identifies every tax deduction
          you qualify for. Built specifically for 1099 workers, freelancers, and
          independent contractors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition"
          >
            Get Started Free →
          </Link>
          <Link
            href="/auth/login"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg transition"
          >
            Sign In
          </Link>
        </div>
        <p className="text-slate-500 text-sm mt-4">No credit card required • Free forever plan</p>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-green-400">$12,400</div>
            <div className="text-slate-400 text-sm mt-1">Average savings per year</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">94%</div>
            <div className="text-slate-400 text-sm mt-1">AI accuracy rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">2 min</div>
            <div className="text-slate-400 text-sm mt-1">To analyze 100 expenses</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-3xl font-bold text-center mb-16">
          How Write-<span className="text-green-400">Off</span> Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📤</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Upload Your Expenses</h3>
            <p className="text-slate-400 leading-relaxed">
              Import bank statements, CSV files, or PDF receipts. Or manually add expenses
              one by one. We support all major banks and formats.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Analyzes Each One</h3>
            <p className="text-slate-400 leading-relaxed">
              Our AI cross-references every expense against IRS Schedule C rules for your
              specific occupation. It explains exactly why each expense is or isn&apos;t
              deductible.
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Export Your Report</h3>
            <p className="text-slate-400 leading-relaxed">
              Generate a clean tax summary report ready to share with your accountant. 
              Every deduction documented with IRS references.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-green-950 to-slate-900 border-t border-green-900 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Find Your Deductions?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of 1099 workers who&apos;ve stopped overpaying taxes.
          </p>
          <Link
            href="/auth/signup"
            className="bg-green-500 hover:bg-green-400 text-slate-900 font-bold px-10 py-4 rounded-xl text-lg inline-block transition"
          >
            Start Free Today →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-sm">
            © 2024 Write-Off. Not tax advice. Consult a qualified tax professional.
          </div>
          <div className="flex gap-6 text-slate-500 text-sm">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
