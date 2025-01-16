import Navbar from "./navbar";
import { User } from "@/types/user";
import Sidebar from "./sidebar";

interface DashboardProps {
    userData: User;
  }
  
  const Dashboard = ({ userData }: DashboardProps) => {
    return (
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="container mx-auto">
            <div className="p-6 rounded-lg border bg-card text-card-foreground">
              <h3 className="text-lg font-semibold mb-2">Account Details</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Name: {userData.name ?? 'Not set'}</p>
                <p>Email: {userData.email}</p>
                <p>Credits: {userData.credit ?? 0}</p>
                <p>Member since: {userData.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };
  
  export default Dashboard;