export default function Footer() {
  return (
    <footer className="border-t border-[#1e2530] bg-[#030507] px-8 py-6 mt-auto">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="font-black text-sm">
          Event<span className="text-[#00E5FF]">Sync</span>
        </span>

        <p className="text-[#3a4550] text-xs">
          © 2026 EventSync · Made in Madagascar By Proxima-dev
        </p>

        <div className="flex items-center gap-4">
          <span className="text-[#3a4550] text-xs hover:text-[#00E5FF] cursor-pointer transition-colors">
            Terms
          </span>
          <span className="text-[#3a4550] text-xs hover:text-[#00E5FF] cursor-pointer transition-colors">
            Privacy
          </span>
        </div>
      </div>
    </footer>
  );
}