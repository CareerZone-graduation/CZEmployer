import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
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
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { changePassword } from '@/services/userService';
import { cn } from '@/lib/utils';

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-900">Cài đặt tài khoản</h1>
        </div>
        <p className="text-gray-600">
          Quản lý thông tin tài khoản và cài đặt bảo mật
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Thông tin tài khoản
            </CardTitle>
            <CardDescription>
              Thông tin cơ bản về tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="font-medium text-gray-900">{user?.user?.email || 'Chưa có thông tin'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ngày tạo tài khoản
                </Label>
                <p className="font-medium text-gray-900">{formatDate(user?.user?.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Quản lý mật khẩu và cài đặt bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <KeyRound className="h-5 w-5 text-gray-600" />
                  Đổi mật khẩu
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="pr-10"
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
                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu mới"
                        className="pr-10"
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
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">Yêu cầu mật khẩu:</p>
                        <ValidationItem valid={passwordValidation.minLength} text="Ít nhất 8 ký tự" />
                        <ValidationItem valid={passwordValidation.hasUppercase} text="Có chữ hoa (A-Z)" />
                        <ValidationItem valid={passwordValidation.hasLowercase} text="Có chữ thường (a-z)" />
                        <ValidationItem valid={passwordValidation.hasNumber} text="Có số (0-9)" />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu mới"
                        className={cn(
                          "pr-10",
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
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <X className="h-4 w-4" />
                        Mật khẩu xác nhận không khớp
                      </p>
                    )}
                    {formData.confirmPassword && passwordsMatch && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="h-4 w-4" />
                        Mật khẩu khớp
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.currentPassword || !isPasswordValid || !passwordsMatch}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang xử lý...
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mẹo bảo mật</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Sử dụng mật khẩu khác nhau cho mỗi tài khoản
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Thay đổi mật khẩu định kỳ (3-6 tháng một lần)
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Không chia sẻ mật khẩu với bất kỳ ai
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                Tránh sử dụng thông tin cá nhân trong mật khẩu (ngày sinh, tên,...)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
