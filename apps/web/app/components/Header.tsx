import Link from "next/link";
import { TiltLogo } from "@repo/utils";
import { GhostButton, PrimaryButton } from "@repo/ui/button";

export default function Header() {
    return (
        <>
            <header className="fixed top-0 z-50 w-full"
                style={{
                    backdropFilter: "blur(20px) saturate(1.4)",
                    WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                    borderBottom: "1px solid rgba(255,255,255,0.045)",
                    background: "rgba(7,7,9,0.3)",
                }}>
                <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
                    <div className="flex flex-1">
                        <TiltLogo />
                    </div>
                    <div className="hidden md:flex items-center justify-center gap-8 text-[12px] text-white/40 font-mono uppercase tracking-wider">
                        {([["#problem", "Problem"], ["#how", "How it works"], ["#features", "Features"], ["#simulation", "Simulation"], ["#faq", "FAQ"]] as [string, string][]).map(([href, label]) => (
                            href.startsWith("/") ? (
                                <Link key={href} href={href}
                                    className="hover:text-[#E8734A] transition-colors duration-200">
                                    {label}
                                </Link>
                            ) : (
                                <a key={href} href={href}
                                    className="hover:text-[#E8734A] transition-colors duration-200">
                                    {label}
                                </a>
                            )
                        ))}
                    </div>
                    <div className="flex flex-1 items-center justify-end gap-2">
                        <Link href={process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3001/docs"}>
                            <GhostButton size="sm">Read docs</GhostButton>
                        </Link>
                        <Link href="/demo"><PrimaryButton size="sm">DASHBOARD</PrimaryButton></Link>
                    </div>
                </nav>
            </header>
        </>
    )
}