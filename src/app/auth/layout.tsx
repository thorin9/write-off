export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Write-<span className="text-green-400">Off</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            AI-powered tax deductions for 1099 workers
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
