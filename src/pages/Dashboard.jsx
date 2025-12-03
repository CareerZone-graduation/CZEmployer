import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import {
  Briefcase, Users, Eye, TrendingUp, Plus, Calendar as CalendarIcon, MapPin,
  Building2, AlertCircle, Clock, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, CreditCard, Wallet
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import recruiterService from "@/services/recruiterService"
import { format } from "date-fns"

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isInitializing } = useSelector((state) => state.auth)
  const company = user?.profile?.company

  const [timeRange, setTimeRange] = useState("30d")
  const [date, setDate] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        let params = { timeRange }

        if (timeRange === 'custom' && date?.from && date?.to) {
          params = {
            timeRange: 'custom',
            from: date.from.toISOString(),
            to: date.to.toISOString()
          }
        }

        const data = await recruiterService.getDashboardStats(params)
        setStats(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
        setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.user?.role === 'recruiter') {
      if (timeRange !== 'custom' || (date?.from && date?.to)) {
        fetchStats()
      }
    }
  }, [timeRange, date, user])

  const getTimeRangeLabel = (range) => {
    switch (range) {
      case '7d': return '7 ngày qua'
      case '30d': return '30 ngày qua'
      case '90d': return '90 ngày qua'
      case '1y': return '1 năm qua'
      case 'custom': return 'Tùy chỉnh'
      default: return '30 ngày qua'
    }
  }

  if (isInitializing) {
    return <div className="p-8 flex justify-center"><Skeleton className="h-96 w-full" /></div>
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Chào {user?.profile?.fullname || "bạn"}, hôm nay bạn có gì mới?
          </p>
        </div>
        <div className="flex items-center gap-3">
          {timeRange === 'custom' && (
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-normal bg-white",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "dd/MM/yyyy")} -{" "}
                          {format(date.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(date.from, "dd/MM/yyyy")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px] bg-white">
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 ngày qua</SelectItem>
              <SelectItem value="30d">30 ngày qua</SelectItem>
              <SelectItem value="90d">90 ngày qua</SelectItem>
              <SelectItem value="1y">1 năm qua</SelectItem>
              <SelectItem value="custom">Tùy chỉnh</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate('/jobs/create')} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Đăng tin mới
          </Button>
        </div>
      </div>

      {/* Company Registration Alert */}
      {!company && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="flex items-center justify-between ml-2 w-full">
            <span>Bạn chưa đăng ký thông tin công ty. Vui lòng đăng ký để bắt đầu tuyển dụng.</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/company-register')} className="bg-white border-red-300 hover:bg-red-100 text-red-800">
              Đăng ký ngay
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Company Verification Alert */}
      {company && !company.verified && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-900">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="flex items-center justify-between ml-2 w-full">
            <span>Công ty của bạn chưa được xác thực. Hãy cập nhật thông tin để tăng độ tin cậy với ứng viên.</span>
            <Button variant="outline" size="sm" onClick={() => navigate('/company-profile')} className="bg-white border-yellow-300 hover:bg-yellow-100 text-yellow-800">
              Cập nhật ngay
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Tin tuyển dụng đang mở"
              value={stats?.summary?.activeJobs?.value || 0}
              change={stats?.summary?.activeJobs?.change}
              icon={Briefcase}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <StatsCard
              title="Tổng lượt ứng tuyển"
              value={stats?.summary?.applications?.value || 0}
              change={stats?.summary?.applications?.change}
              icon={Users}
              color="text-blue-600"
              bg="bg-blue-50"
            />
            <StatsCard
              title="Chờ xem xét"
              value={stats?.summary?.pendingReview?.value || 0}
              change={null} // Snapshot metric
              icon={Clock}
              color="text-orange-600"
              bg="bg-orange-50"
            />
            <StatsCard
              title="Phỏng vấn sắp tới"
              value={stats?.summary?.interviews?.value || 0}
              change={stats?.summary?.interviews?.change}
              icon={CalendarIcon}
              color="text-purple-600"
              bg="bg-purple-50"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Charts */}
            <div className="lg:col-span-2 space-y-8">
              {/* Application Trend Chart */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Xu hướng ứng tuyển</CardTitle>
                  <CardDescription>Số lượng đơn ứng tuyển theo thời gian ({getTimeRangeLabel(timeRange)})</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats?.chart || []}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          tickFormatter={(str) => format(new Date(str), 'dd/MM')}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy')}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorApps)"
                          name="Ứng tuyển"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recruitment Funnel */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Phễu tuyển dụng</CardTitle>
                  <CardDescription>Hiệu quả quy trình tuyển dụng của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <FunnelStep label="Tổng đơn" value={stats?.funnel?.total || 0} color="bg-blue-100 text-blue-700" />
                    <FunnelStep label="Đang xem xét" value={stats?.funnel?.underReview || 0} color="bg-indigo-100 text-indigo-700" />
                    <FunnelStep label="Phỏng vấn" value={stats?.funnel?.interview || 0} color="bg-purple-100 text-purple-700" />
                    <FunnelStep label="Đã tuyển" value={stats?.funnel?.hired || 0} color="bg-emerald-100 text-emerald-700" />
                  </div>
                  {/* Visual Bar Representation */}
                  <div className="mt-6 space-y-2">
                    <FunnelBar label="Đang xem xét" total={stats?.funnel?.total} value={stats?.funnel?.underReview} color="bg-indigo-500" />
                    <FunnelBar label="Phỏng vấn" total={stats?.funnel?.total} value={stats?.funnel?.interview} color="bg-purple-500" />
                    <FunnelBar label="Đã tuyển" total={stats?.funnel?.total} value={stats?.funnel?.hired} color="bg-emerald-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Widgets */}
            <div className="space-y-8">
              {/* Top Jobs */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Việc làm nổi bật</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {stats?.topJobs?.map((job) => (
                      <div key={job._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/jobs/${job._id}/applications`)}>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-gray-900 line-clamp-1">{job.title}</h4>
                          <Badge variant="secondary" className="text-xs">{job.applicationCount} đơn</Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className={job.status === 'ACTIVE' ? 'text-emerald-600' : 'text-gray-500'}>{job.status}</span>
                          {job.newApplications > 0 && (
                            <span className="text-emerald-600 font-medium">+{job.newApplications} mới</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!stats?.topJobs || stats.topJobs.length === 0) && (
                      <div className="p-6 text-center text-gray-500 text-sm">Chưa có dữ liệu</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Interviews */}
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Lịch phỏng vấn</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {stats?.upcomingInterviews?.map((interview) => (
                      <div key={interview._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/interviews/${interview._id}`)}>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {format(new Date(interview.scheduledTime), 'dd/MM')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{interview.roomName}</p>
                            <p className="text-xs text-gray-500 truncate">{interview.jobId?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-gray-900">{format(new Date(interview.scheduledTime), 'HH:mm')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!stats?.upcomingInterviews || stats.upcomingInterviews.length === 0) && (
                      <div className="p-6 text-center text-gray-500 text-sm">Không có lịch phỏng vấn sắp tới</div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <Button variant="ghost" className="w-full text-sm text-gray-600" onClick={() => navigate('/interviews')}>
                      Xem tất cả lịch
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper Components
const StatsCard = ({ title, value, change, icon: Icon, color, bg }) => (
  <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== null && (
            <div className={`flex items-center mt-1 text-xs ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {change >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              <span className="font-medium">{Math.abs(change)}</span>
              <span className="text-gray-400 ml-1">so với kỳ trước</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bg} ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const FunnelStep = ({ label, value, color }) => (
  <div className={`rounded-lg p-3 text-center ${color}`}>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-xs opacity-80 mt-1">{label}</p>
  </div>
)

const FunnelBar = ({ label, total, value, color }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="w-24 text-gray-600">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="w-12 text-right font-medium text-gray-900">{percentage}%</span>
    </div>
  )
}

const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Charts Skeleton */}
      <div className="lg:col-span-2 space-y-8">
        {/* Chart Skeleton */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </CardContent>
        </Card>

        {/* Funnel Skeleton */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-full rounded-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Widgets Skeleton */}
      <div className="space-y-8">
        {/* Top Jobs Skeleton */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4">
                  <div className="flex justify-between mb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interviews Skeleton */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <Skeleton className="h-9 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export default Dashboard
