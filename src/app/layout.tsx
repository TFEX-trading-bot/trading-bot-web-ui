// /Users/tung/Desktop/CE Project/trading-bot-web-ui/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter, Kanit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const kanit = Kanit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Trading-Bot-System | AI อัจฉริยะสำหรับ SET50 & TFEX",
  description: "ระบบบอทเทรดอัจฉริยะ วิเคราะห์กราฟเทคนิค Real-time แม่นยำ รวดเร็ว และไร้อารมณ์",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="scroll-smooth">
      <body
        className={`${inter.variable} ${kanit.variable} font-kanit bg-brand-dark text-white overflow-x-hidden selection:bg-brand-500 selection:text-white antialiased`}
      >
        {children}
      </body>
    </html>
  )
}