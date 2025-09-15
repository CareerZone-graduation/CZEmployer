
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Briefcase, Users, Eye, TrendingUp, Plus, Calendar, MapPin, Building2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isInitializing } = useSelector((state) => state.auth)
  const company = user?.profile?.company

  const stats = [
    {
      title: "Active Jobs",
      value: "12",
      change: "+2 this week",
      icon: Briefcase,
      color: "text-green-700",
    },
    {
      title: "Total Applications",
      value: "248",
      change: "+15 today",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Profile Views",
      value: "1,234",
      change: "+8% this month",
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "Hire Rate",
      value: "23%",
      change: "+5% vs last month",
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ]

  const recentJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      location: "Ho Chi Minh City",
      applications: 45,
      status: "Active",
      postedDate: "2 days ago",
    },
    {
      id: 2,
      title: "Product Manager",
      location: "Hanoi",
      applications: 32,
      status: "Active",
      postedDate: "1 week ago",
    },
    {
      id: 3,
      title: "UX/UI Designer",
      location: "Da Nang",
      applications: 28,
      status: "Draft",
      postedDate: "3 days ago",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 rounded-lg p-6 text-white">
        {isInitializing ? (
          <Skeleton className="h-8 w-1/2 bg-white/20" />
        ) : (
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.profile?.fullname || "Recruiter"}!
          </h2>
        )}
        <p className="text-green-100 mb-4">Here's what's happening with your recruitment activities today.</p>
        <Button className="bg-white text-green-700 hover:bg-gray-100">
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Company Status Section */}
      {user?.user?.role === 'recruiter' && (
        <div>
          {isInitializing ? (
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ) : company ? (
            <Card className="border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-green-600" />
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <CardDescription>{company.industry}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={company.verified ? "default" : "secondary"}>
                    {company.verified ? "Đã xác thực" : "Chờ xác thực"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {company.about?.length > 150 
                    ? `${company.about.substring(0, 150)}...` 
                    : company.about
                  }
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {company.size && (
                    <span>{company.size}</span>
                  )}
                  {company.location?.province && (
                    <span>
                      {`${company.location?.commune}, ${company.location?.district}, ${company.location?.province}`}
                    </span>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Chưa có thông tin công ty</strong>
                    <p className="mt-1">Bạn cần đăng ký thông tin công ty để bắt đầu tuyển dụng.</p>
                  </div>
                  <Button 
                    onClick={() => navigate('/company-register')}
                    className="ml-4 bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    Đăng ký công ty
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Jobs */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-black">Recent Jobs</CardTitle>
          <CardDescription>Your latest job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-black">{job.title}</h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job.applications} applications
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.postedDate}
                    </div>
                  </div>
                </div>
                <Badge
                  variant={job.status === "Active" ? "default" : "secondary"}
                  className={job.status === "Active" ? "bg-green-500 text-white" : ""}
                >
                  {job.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
