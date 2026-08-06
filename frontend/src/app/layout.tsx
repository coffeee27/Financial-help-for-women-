import { FinanceProvider } from "../context/FinanceContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FinanceProvider>
          {children}
        </FinanceProvider>
      </body>
    </html>
  );
}