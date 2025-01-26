import Navbar from "./navbar";
import { User } from "@/types/user";
import Sidebar from "./sidebar";

import { 
  BookOpen, 
  Code2, 
  Users, 
  FolderGit2,
  GraduationCap,
  Timer,
  GitBranch 
} from "lucide-react";

interface DashboardProps {
  userData: User;
}

const Dashboard = ({ userData }: DashboardProps) => {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="container mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-8 rounded-lg text-white">
            <h1 className="text-3xl font-bold">Welcome back, {userData.name ?? 'User'}!</h1>
            <p className="opacity-90">Track your learning progress and achievements.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-900 rounded-full">
                  <BookOpen className="text-blue-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Roadmap Progress</p>
                  <h3 className="text-2xl font-bold text-white">45%</h3>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-900 rounded-full">
                  <Code2 className="text-green-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Content Completed</p>
                  <h3 className="text-2xl font-bold text-white">24/50</h3>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-900 rounded-full">
                  <Users className="text-purple-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Mentorship Hours</p>
                  <h3 className="text-2xl font-bold text-white">12h</h3>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 hover:border-gray-600 transition-all">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-900 rounded-full">
                  <FolderGit2 className="text-orange-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Projects Done</p>
                  <h3 className="text-lg font-semibold text-white">5</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Progress Section */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Learning Progress</h2>
              <button className="text-blue-400 hover:text-blue-300">View all</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                <GraduationCap className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-white">Completed React Basics</p>
                  <p className="text-sm text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                <GitBranch className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-white">Started New Project</p>
                  <p className="text-sm text-gray-400">Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                <Timer className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-white">Mentorship Session</p>
                  <p className="text-sm text-gray-400">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;