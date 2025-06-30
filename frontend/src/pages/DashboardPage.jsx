import { useAuthStore } from "@/store/authStore";

function DashboardPage() {
  const { user, isCheckingAuth } = useAuthStore();

  return (
    <div>
      {isCheckingAuth ? (
        <p>Loading...</p>
      ) : (
        <h1>
          Welcome, {user.name}, {user.email}!
        </h1>
      )}
    </div>
  );
}
export default DashboardPage;
