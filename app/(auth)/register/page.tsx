"Use client";

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
                    </div>
                </form>
            </div>
        </main >
    );
}