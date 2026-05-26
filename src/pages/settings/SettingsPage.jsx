import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Loader2, 
  KeyRound,
  User,
  Mail,
  Calendar,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/services/userService';
import { cn } from '@/lib/utils';
import KnowledgeBaseManagement from '@/pages/KnowledgeBase/KnowledgeBaseManagement';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'account';

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Password validation rules
  const passwordValidation = useMemo(() => {
    const password = formData.newPassword;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [formData.newPassword]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = formData.newPassword === formData.confirmPassword && formData.confirmPassword !== '';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!isPasswordValid) {
      setError('Mật khẩu mới chưa đáp ứng đủ yêu cầu');
      return;
    }

    if (!passwordsMatch) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsSubmitting(true);
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success('Đổi mật khẩu thành công!');
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ValidationItem = ({ valid, text }) => (
    <div className={cn(
      "flex items-center gap-2 text-sm transition-colors",
      valid ? "text-green-600" : "text-gray-500"
    )}>
      {valid ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <X className="h-4 w-4 text-gray-400" />
      )}
      {text}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Cài đặt hệ thống</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Quản lý tài khoản bảo mật và các tài liệu huấn luyện AI chatbot nội bộ của doanh nghiệp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Sub-navigation Menu */}
        <div className="lg:col-span-1 space-y-1.5">
          <button
            onClick={() => handleTabChange('account')}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 text-left",
              activeTab === 'account'
                ? "bg-emerald-50 text-emerald-700 border-emerald-600 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
            )}
          >
            <User className={cn("h-5 w-5", activeTab === 'account' ? "text-emerald-700" : "text-gray-400")} />
            <div>
              <div className="text-sm font-semibold">Tài khoản & Bảo mật</div>
              <div className="text-xs text-gray-400 font-normal mt-0.5">Thông tin chung & Mật khẩu</div>
            </div>
          </button>
          
          <button
            onClick={() => handleTabChange('knowledge-base')}
            className={cn(
              "w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border-l-4 text-left",
              activeTab === 'knowledge-base'
                ? "bg-emerald-50 text-emerald-700 border-emerald-600 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent"
            )}
          >
            <BookOpen className={cn("h-5 w-5", activeTab === 'knowledge-base' ? "text-emerald-700" : "text-gray-400")} />
            <div>
              <div className="text-sm font-semibold">Tài liệu nội bộ</div>
              <div className="text-xs text-gray-400 font-normal mt-0.5">Tài liệu học tập của AI chatbot</div>
            </div>
          </button>
        </div>

        {/* Right Column: Tab Content */}
        <div className="lg:col-span-3">
          {activeTab === 'account' ? (
            <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
              {/* Account Info Card */}
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-50">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <User className="h-5 w-5 text-emerald-600" />
                    Thông tin tài khoản
                  </CardTitle>
                  <CardDescription>
                    Thông tin cơ bản về tài khoản nhà tuyển dụng của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        Địa chỉ Email
                      </Label>
                      <p className="font-semibold text-gray-800 text-sm bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">{user?.user?.email || 'Chưa có thông tin'}</p>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        Ngày tham gia
                      </Label>
                      <p className="font-semibold text-gray-800 text-sm bg-gray-50 px-3.5 py-2 rounded-lg border border-gray-100">{formatDate(user?.user?.createdAt)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Card */}
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="pb-4 border-b border-gray-50">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    Bảo mật
                  </CardTitle>
                  <CardDescription>
                    Thay đổi mật khẩu tài khoản thường xuyên để nâng cao bảo mật thông tin
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-gray-800">
                        <KeyRound className="h-4 w-4 text-gray-500" />
                        Đổi mật khẩu
                      </h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                          <Alert variant="destructive" className="rounded-xl">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}

                        {/* Current Password */}
                        <div className="space-y-2">
                          <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-700">Mật khẩu hiện tại</Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              name="currentPassword"
                              type={showPasswords.current ? 'text' : 'password'}
                              value={formData.currentPassword}
                              onChange={handleChange}
                              placeholder="Nhập mật khẩu hiện tại"
                              className="pr-10 rounded-xl"
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('current')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords.current ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type={showPasswords.new ? 'text' : 'password'}
                              value={formData.newPassword}
                              onChange={handleChange}
                              placeholder="Nhập mật khẩu mới"
                              className="pr-10 rounded-xl"
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('new')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords.new ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>

                          {/* Password Requirements */}
                          {formData.newPassword && (
                            <div className="mt-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Yêu cầu mật khẩu mới:</p>
                              <ValidationItem valid={passwordValidation.minLength} text="Ít nhất 8 ký tự" />
                              <ValidationItem valid={passwordValidation.hasUppercase} text="Có ít nhất một chữ hoa (A-Z)" />
                              <ValidationItem valid={passwordValidation.hasLowercase} text="Có ít nhất một chữ thường (a-z)" />
                              <ValidationItem valid={passwordValidation.hasNumber} text="Có ít nhất một chữ số (0-9)" />
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type={showPasswords.confirm ? 'text' : 'password'}
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              placeholder="Nhập lại mật khẩu mới"
                              className={cn(
                                "pr-10 rounded-xl",
                                formData.confirmPassword && (passwordsMatch ? "border-green-500 focus-visible:ring-green-500" : "border-red-500 focus-visible:ring-red-500")
                              )}
                              disabled={isSubmitting}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirm')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showPasswords.confirm ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          {formData.confirmPassword && !passwordsMatch && (
                            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1 font-medium">
                              <X className="h-4 w-4" />
                              Mật khẩu xác nhận không khớp
                            </p>
                          )}
                          {formData.confirmPassword && passwordsMatch && (
                            <p className="text-sm text-green-600 flex items-center gap-1.5 mt-1 font-medium">
                              <Check className="h-4 w-4" />
                              Mật khẩu xác nhận hoàn toàn khớp
                            </p>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={isSubmitting || !formData.currentPassword || !isPasswordValid || !passwordsMatch}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm px-6 font-semibold transition-all"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Đang cập nhật...
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Đổi mật khẩu
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Tips */}
              <Card className="border border-gray-100 bg-emerald-50/20 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Mẹo bảo mật tài khoản</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 text-sm text-gray-600">
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      Sử dụng mật khẩu mạnh, kết hợp các ký tự đặc biệt và chữ số khác nhau.
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      Nên thay đổi mật khẩu định kỳ 3 đến 6 tháng một lần.
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      Tuyệt đối không chia sẻ tài khoản đăng nhập CareerZone với bất kỳ công cụ hoặc người lạ nào.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <KnowledgeBaseManagement />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
