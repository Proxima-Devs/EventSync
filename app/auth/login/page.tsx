"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Inbox } from "lucide-react";

export default function LoginPage() {
    const { data: session } = authClient.useSession();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"oauth" | "email">("oauth");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (session) router.replace("/admin/dashboard");
    }, [session, router]);

    useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const handleMouseMove = (e: MouseEvent) =>
        setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
        cancelAnimationFrame(id);
        window.removeEventListener("mousemove", handleMouseMove);
    };
}, []);

    const handleMagicLink = async () => {
        if (!email) return;
        setLoading(true);
        setError("");

        const { error } = await authClient.signIn.magicLink({
            email,
            callbackURL: "/admin/dashboard",
        });

        if (error) {
            setError("Erreur lors de l'envoi. Vérifiez l'adresse email.");
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    return (
        <main
            ref={containerRef}
            className="min-h-screen bg-[#030507] flex items-center justify-center px-4 relative overflow-hidden"
        >
            {/* Mouse glow */}
            <div
                className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0,229,255,0.06), transparent 60%)`,
                }}
            />

            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-50 -left-25 w-125 h-125 rounded-full bg-[#00E5FF05] blur-[120px] animate-pulse" />
                <div className="absolute -bottom-50 -right-25 w-125 h-125 rounded-full bg-[#0066ff05] blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-px bg-linear-to-r from-transparent via-[#00E5FF15] to-transparent" />
                <div className="absolute w-64 h-64 rounded-full opacity-[0.07]" style={{ background: "radial-gradient(circle, #00E5FF, transparent)", top: "10%", left: "15%", animation: "float1 8s ease-in-out infinite" }} />
                <div className="absolute w-48 h-48 rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #0066ff, transparent)", top: "60%", right: "10%", animation: "float2 10s ease-in-out infinite" }} />
                <div className="absolute w-32 h-32 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #00E5FF, transparent)", bottom: "15%", left: "25%", animation: "float3 6s ease-in-out infinite" }} />
            </div>

            {/* Grid */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }}
            />

            <div className={`relative z-10 w-full max-w-95 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center w-full overflow-visible">
                        <h1 className="text-8xl font-bold pb-9 font-[Lavishly_Yours] bg-linear-to-tl from-white via-cyan-300 to-blue-500 bg-clip-text text-transparent leading-none whitespace-nowrap min-w-max">
                            EventSync
                        </h1>
                    </div>
                    <p className="text-[#4a5568] text-sm mt-2 tracking-wide">
                        Synchronize your event experience
                    </p>
                </div>

                {/* Card */}
                <div className="relative">
                    <div className="absolute -inset-px rounded-3xl bg-linear-to-b from-[#00E5FF22] via-[#ffffff05] to-[#00E5FF11] pointer-events-none" />

                    <div className="relative bg-[#080b0f] rounded-3xl p-7 flex flex-col gap-4">

                        {/* ── OAuth step ── */}
                        {step === "oauth" && (
                            <div className={`flex flex-col gap-3 transition-all duration-500 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}>

                                {/* Google */}
                                <button
                                    onClick={() => authClient.signIn.social({ provider: "google", callbackURL: "/admin/dashboard" })}
                                    className="cursor-pointer group relative w-full py-3.5 rounded-2xl bg-[#0d1117] border border-[#1e2530] text-white text-sm font-semibold hover:border-[#00E5FF44] hover:bg-[#0d1520] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-[#00E5FF08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <svg width="18" height="18" viewBox="0 0 24 24" className="relative z-10">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="relative z-10 text-base">Continue with Google</span>
                                </button>

                                {/* GitHub */}
                                <button
                                    onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/admin/dashboard" })}
                                    className="cursor-pointer group relative w-full py-3.5 rounded-2xl bg-[#0d1117] border border-[#1e2530] text-white text-sm font-semibold hover:border-[#00E5FF44] hover:bg-[#0d1520] transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-[#00E5FF08] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="relative z-10">
                                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span className="relative z-10 text-base">Continue with GitHub</span>
                                </button>

                                <div className="flex items-center gap-3 my-1">
                                    <div className="flex-1 h-px bg-linear-to-r from-transparent to-[#1e2530]" />
                                    <span className="text-[10px] text-[#3a4550] font-bold uppercase tracking-widest">or continue with email</span>
                                    <div className="flex-1 h-px bg-linear-to-l from-transparent to-[#1e2530]" />
                                </div>

                                <button
                                    onClick={() => setStep("email")}
                                    className="cursor-pointer group relative w-full py-3.5 rounded-2xl bg-[#00E5FF] text-black text-sm font-bold hover:bg-[#00ffff] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF33] hover:shadow-[#00E5FF55] hover:scale-[1.02]"
                                >
                                    <span>✉</span>
                                    Continue with Email
                                    <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                                </button>
                            </div>
                        )}

                        {/* ── Email / Magic Link step ── */}
                        {step === "email" && (
                            <div className="cursor-pointer flex flex-col gap-4 animate-in slide-in-from-right duration-300">
                                <button
                                    onClick={() => { setStep("oauth"); setSent(false); setError(""); setEmail(""); }}
                                    className="flex items-center gap-2 text-[#4a5568] hover:text-[#00E5FF] text-xs transition-colors w-fit"
                                >
                                    ← Back
                                </button>

                                {sent ? (
                                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                                        <Inbox className="text-[#00E5FF]"/>
                                        <p className="text-white text-sm font-semibold">Check your inbox</p>
                                        <p className="text-[#4a5568] text-xs leading-relaxed">
                                            We sent a magic link to <span className="text-[#00E5FF]">{email}</span>.
                                            Click it to sign in instantly.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-xs text-[#4a5568] uppercase tracking-widest mb-2">
                                                Email address
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleMagicLink()}
                                                placeholder="example@gmail.com"
                                                autoFocus
                                                className="w-full bg-[#0d1117] border border-[#1e2530] rounded-xl px-4 py-3 text-sm text-white placeholder-[#2a3540] focus:outline-none focus:border-[#00E5FF66] focus:ring-1 focus:ring-[#00E5FF22] transition-all"
                                            />
                                            {error && (
                                                <p className="text-red-400 text-xs mt-2">{error}</p>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleMagicLink}
                                            disabled={loading || !email}
                                            className="cursor-pointer w-full py-3.5 rounded-2xl bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#00ffff] transition-all duration-300 shadow-lg shadow-[#00E5FF33] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] hover:shadow-[#00E5FF55]"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                    Sending link…
                                                </span>
                                            ) : (
                                                "Send Magic Link →"
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        <p className="text-center text-[10px] text-[#2a3540] mt-2 leading-relaxed">
                            By continuing, you agree to our{" "}
                            <span className="text-[#00E5FF66] hover:text-[#00E5FF] cursor-pointer transition-colors">Terms of Service</span>{" "}
                            and{" "}
                            <span className="text-[#00E5FF66] hover:text-[#00E5FF] cursor-pointer transition-colors">Privacy Policy</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}