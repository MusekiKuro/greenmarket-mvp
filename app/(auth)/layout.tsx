import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between gradient-green p-12 text-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">GreenMarket</span>
        </Link>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold leading-tight text-balance">
            Добро пожаловать
            <br />
            на GreenMarket
          </h2>
          <p className="text-white/75 text-base leading-relaxed max-w-md">
            Покупайте и продавайте товары безопасно и удобно. Присоединяйтесь к
            сообществу тысяч пользователей.
          </p>
        </div>

        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} GreenMarket
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center bg-background p-6 sm:p-8">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-green">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              GreenMarket
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
