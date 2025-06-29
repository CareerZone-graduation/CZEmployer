import { useState, useEffect, useCallback } from "react"
import { Link, useLocation } from "react-router-dom"
import { Building2, LayoutDashboard, Briefcase, Bell, Users, BarChart3, Settings, User } from "lucide-react"
import * as authService from "@/services/authService"
import { Skeleton } from "@/components/ui/skeleton"

const DashboardSidebar = ({ isOpen }) => {
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await authService.getMe()
      if (response?.data) {
        setUser(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error)
      // Handle error, e.g., redirect to login
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const menuItems = [
    { title: "Overview", icon: LayoutDashboard, path: "/dashboard" },
    { title: "Company Profile", icon: Building2, path: "/dashboard/company" },
    { title: "Job Management", icon: Briefcase, path: "/dashboard/jobs" },
  ]

  const settingsItems = [
    // { title: "Settings", icon: Settings, path: "/dashboard/settings" },
    // { title: "Profile", icon: User, path: "/dashboard/profile" },
  ]

  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-screen`}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-700 rounded-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            {isOpen && (
              <div>
                <h2 className="font-bold text-black">CareerZone</h2>
                <p className="text-sm text-gray-600">Recruiter Portal</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8">
          <div className="px-4">
            {isOpen && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Main Menu</p>}
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path ? "bg-green-700 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {isOpen && <span className="font-medium">{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>

          <div className="px-4 mt-8">
            {isOpen && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Account</p>}
            <div className="space-y-1">
              {settingsItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path ? "bg-green-700 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {isOpen && <span className="font-medium">{item.title}</span>}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        {isOpen && (
          <>
            {isLoading ? (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-black truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default DashboardSidebar
