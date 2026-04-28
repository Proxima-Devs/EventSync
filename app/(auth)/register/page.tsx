export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-[#080a0c] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#00E5FF08] blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="inline-flex w-12 h-12 rounded-2xl bg-[#00E5FF] items-center justify-center font-black text-black text-xl mb-4">
                        E
                    </div>
                    <h1 className="text-2xl font-black text-white">
                        Event<span className="text-[#00E5FF]">Sync</span>
                    </h1>
                    <p className="text-[#555] text-sm mt-1">Create your account</p>
                </div>
                <div className="bg-[#0d0f12] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="john_doe"
                                className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                                Firstname
                            </label>
                            <input
                                type="text"
                                placeholder="John"
                                className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}