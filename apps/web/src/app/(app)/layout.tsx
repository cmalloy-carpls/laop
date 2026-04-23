// Auth enforcement is handled entirely by middleware (src/middleware.ts).
// This layout can safely assume a session exists.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <main>{children}</main>;
}
