import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Users, Briefcase } from 'lucide-react';
import { VIETNAMESE_CONTENT, PROFESSIONAL_CONTENT } from '@/constants/vietnamese';
import { submitContactForm } from '@/services/contactService';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(50, 'Tên không được quá 50 ký tự'),
  email: z.string()
    .email('Email không hợp lệ')
    .min(1, 'Email là bắt buộc'),
  company: z.string()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(100, 'Tên công ty không được quá 100 ký tự'),
  phone: z.string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .max(15, 'Số điện thoại không được quá 15 số')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  title: z.string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(100, 'Tiêu đề không được quá 100 ký tự'),
  category: z.string()
    .min(1, 'Vui lòng chọn nhu cầu tư vấn'),
  message: z.string()
    .min(10, 'Tin nhắn phải có ít nhất 10 ký tự')
    .max(500, 'Tin nhắn không được quá 500 ký tự')
});

const categories = [
  { value: '', label: 'Chọn nhu cầu tư vấn' },
  { value: 'general-inquiry', label: 'Thắc mắc chung' },
  { value: 'technical-issue', label: 'Tôi cần hỗ trợ kỹ thuật' },
  { value: 'account-issue', label: 'Tôi cần hỗ trợ tài khoản' },
  { value: 'payment-issue', label: 'Tôi cần hỗ trợ thanh toán' },
  { value: 'job-posting-issue', label: 'Tôi cần hỗ trợ đăng tin tuyển dụng' },
  { value: 'application-issue', label: 'Tôi cần hỗ trợ quản lý ứng viên' }
];

const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      title: '',
      category: '',
      message: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Submit to backend API
      await submitContactForm(data);
      
      toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 48 giờ.');
      form.reset();
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email hỗ trợ',
      content: 'support@careerzone.vn',
      description: 'Gửi email cho chúng tôi bất cứ lúc nào, 24/7'
    },
    {
      icon: Phone,
      title: 'Hotline tư vấn',
      content: '1900 1234 (miễn phí)',
      description: 'Thứ 2 - Thứ 6: 8:00 - 18:00, Thứ 7: 8:00 - 12:00'
    },
    {
      icon: MapPin,
      title: 'Văn phòng đại diện',
      content: 'Tầng 15, Tòa nhà Bitexco Financial, Quận 1, TP.HCM',
      description: 'Trụ sở chính tại Việt Nam'
    },
    {
      icon: Clock,
      title: 'Thời gian phản hồi',
      content: 'Trong vòng 2 giờ',
      description: 'Cam kết phản hồi nhanh chóng trong giờ hành chính'
    }
  ];

  const trustMetrics = [
    {
      icon: Users,
      number: '500+',
      label: 'Doanh nghiệp hàng đầu tin tưởng'
    },
    {
      icon: Briefcase,
      number: '15,000+',
      label: 'Vị trí tuyển dụng thành công'
    },
    {
      icon: CheckCircle,
      number: '98%',
      label: 'Tỷ lệ hài lòng khách hàng'
    }
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            {PROFESSIONAL_CONTENT.contact.title.split('CareerZone')[0]}
            <span className="text-emerald-600">CareerZone</span>
            {PROFESSIONAL_CONTENT.contact.title.split('CareerZone')[1]}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {PROFESSIONAL_CONTENT.contact.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <Card className="shadow-xl border-0 bg-white">
            <CardHeader className="pb-8">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {PROFESSIONAL_CONTENT.contact.form.title}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {PROFESSIONAL_CONTENT.contact.form.subtitle}
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{VIETNAMESE_CONTENT.forms.fullName} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={VIETNAMESE_CONTENT.forms.placeholder.name}
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{VIETNAMESE_CONTENT.forms.email} *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder={VIETNAMESE_CONTENT.forms.placeholder.email}
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{VIETNAMESE_CONTENT.forms.company} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={VIETNAMESE_CONTENT.forms.placeholder.company}
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{VIETNAMESE_CONTENT.forms.phone} *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={VIETNAMESE_CONTENT.forms.placeholder.phone}
                              {...field}
                              className="h-11"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tiêu đề *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Nhập tiêu đề yêu cầu hỗ trợ"
                            {...field}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nhu cầu tư vấn *</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                          >
                            {categories.map((cat) => (
                              <option key={cat.value} value={cat.value}>
                                {cat.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{VIETNAMESE_CONTENT.forms.message} *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={VIETNAMESE_CONTENT.forms.placeholder.message}
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Gửi yêu cầu tư vấn
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information & Trust Indicators */}
          <div className="space-y-8">
            {/* Contact Info */}
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <info.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                    <p className="text-gray-900 font-medium mb-1">{info.content}</p>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Metrics */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Tại sao chọn CareerZone?
                </h3>
                <div className="grid gap-6">
                  {trustMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <metric.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-emerald-600">{metric.number}</div>
                        <div className="text-sm text-gray-700">{metric.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-12 shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Bắt đầu dùng thử miễn phí ngay hôm nay
            </h3>
            <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
              Không cần thẻ tín dụng. Thiết lập trong 5 phút. 
              Hỗ trợ khách hàng 24/7 bằng tiếng Việt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-emerald-600 hover:bg-gray-50 font-semibold px-8 py-3 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                asChild
              >
                <a href="/auth/register">
                  Dùng thử miễn phí 14 ngày
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-emerald-600 font-semibold px-8 py-3 h-auto transition-all duration-300"
                asChild
              >
                <a href="#features">
                  Xem demo sản phẩm
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;