import Link from "next/link";
import LogoMark from "./LogoMark";

interface NavbarProps {
  children?: React.ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <header className="flex items-center justify-between border-b border-emerald-500/10 bg-black/80 backdrop-blur-sm px-4 sm:px-6 py-3 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 group">
        <LogoMark size="sm" className="group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300" />
        <span className="text-xl font-extrabold tracking-tight">
          <span className="text-neutral-100">Code</span>
          <span className="text-emerald-400">Battle</span>
        </span>
      </Link>
      {children && (
        <nav className="flex items-center gap-2">
          {children}
        </nav>
      )}
    </header>
  );
}
