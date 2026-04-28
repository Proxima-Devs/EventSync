"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


import Link from "next/link";
import router from "next/dist/shared/lib/router/router";
import { authClient } from "@/lib/auth-client";


export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [firstname, setFirstname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name: `${firstname}`,
        });

        if (error) {
            setError(error.message ?? "Une erreur est survenue");
            setLoading(false);
            return;
        }

        router.push("/login");
        setLoading(false);
    };

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
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#0d0f12] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-4"
                >
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Tsutoru"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                                Firstname
                            </label>
                            <input
                                type="text"
                                placeholder="Nomena"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Nomena@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#444] focus:outline-none focus:border-[#00E5FF55] transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-[#555] uppercase tracking-wider mb-1.5">
                            Birth Date
                        </label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full bg-[#111318] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E5FF55] transition-all"
                        />
                    </div>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5">
                            <span className="text-red-400 text-xs">⚠</span>
                            <p className="text-red-400 text-xs font-medium">{error}</p>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full py-3 rounded-xl bg-[#00E5FF] text-black font-bold text-sm hover:bg-[#00ffff] transition-colors shadow-lg shadow-[#00E5FF22] disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                    <p className="text-center text-xs text-[#555]">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-[#00E5FF] hover:text-[#00ffff] font-bold transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-[1px] bg-[#1a1a1a]" />
                        <span className="text-xs text-[#555]">or continue with</span>
                        <div className="flex-1 h-[1px] bg-[#1a1a1a]" />
                    </div>

                    <button
                        type="button"
                        className="w-full py-3 rounded-xl bg-[#111318] border border-[#2a2a2a] text-white text-sm font-semibold hover:border-[#00E5FF55] hover:bg-[#16161f] transition-all flex items-center justify-center gap-2"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>
                </form>
            </div>
        </main >
    );
}