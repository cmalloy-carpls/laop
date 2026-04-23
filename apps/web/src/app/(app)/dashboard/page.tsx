import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getSession();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Signed in as {session?.userId}</p>
    </div>
  );
}
