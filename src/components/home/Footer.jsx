import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Tuyển dụng', href: '/careers' },
    { name: 'Tin tức', href: '/news' },
    { name: 'Liên hệ', href: '/contact' }
  ];

  const productLinks = [
    { name: 'Tính năng', href: '#features' },
    { name: 'Giải pháp', href: '#solutions' },
    { name: 'Giá cả', href: '#pricing' },
    { name: 'API', href: '/api-docs' }
  ];

  const supportLinks = [
    { name: 'Trung tâm hỗ trợ', href: '/support' },
    { name: 'Hướng dẫn sử dụng', href: '/guides' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Báo cáo lỗi', href: '/report-bug' }
  ];

  const legalLinks = [
    { name: 'Điều khoản sử dụng', href: '/terms' },
    { name: 'Chính sách bảo mật', href: '/privacy' },
    { name: 'Chính sách cookie', href: '/cookies' },
    { name: 'Quy định pháp lý', href: '/legal' }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'LinkedIn', href: '#', icon: Linkedin },
    { name: 'YouTube', href: '#', icon: Youtube }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Company Information */}
            <div className="lg:col-span-4">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                  <Briefcase className="h-6 w-6" />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Career<span className="text-emerald-400">Zone</span>
                </span>
              </div>

              {/* Company Description */}
              <p className="text-gray-400 mb-6 leading-relaxed">
                Nền tảng tuyển dụng chuyên nghiệp hàng đầu Việt Nam, kết nối doanh nghiệp với ứng viên chất lượng cao. 
                Tối ưu hóa quy trình tuyển dụng với công nghệ AI tiên tiến và dịch vụ hỗ trợ tận tâm.
              </p>

              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a 
                    href="mailto:contact@careerzone.vn" 
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200"
                  >
                    contact@careerzone.vn
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <a 
                    href="tel:+84123456789" 
                    className="text-gray-300 hover:text-emerald-400 transition-colors duration-200"
                  >
                    +84 123 456 789
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <address className="text-gray-300 not-italic">
                    Tầng 15, Tòa nhà Bitexco Financial<br />
                    2 Hải Triều, Bến Nghé<br />
                    Quận 1, TP. Hồ Chí Minh, Việt Nam
                  </address>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                {/* Company Links */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Công ty</h3>
                  <nav>
                    <ul className="space-y-3">
                      {companyLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Product Links */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
                  <nav>
                    <ul className="space-y-3">
                      {productLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Support Links */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
                  <nav>
                    <ul className="space-y-3">
                      {supportLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Legal Links */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Pháp lý</h3>
                  <nav>
                    <ul className="space-y-3">
                      {legalLinks.map((link) => (
                        <li key={link.name}>
                          <a
                            href={link.href}
                            className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 text-sm"
                          >
                            {link.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <h3 className="text-white font-semibold mb-2">Nhận bản tin tuyển dụng</h3>
              <p className="text-gray-400 text-sm">
                Đăng ký để nhận thông tin về tính năng mới, xu hướng tuyển dụng và các mẹo hữu ích
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 sm:w-64 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                aria-label="Địa chỉ email để đăng ký nhận tin"
              />
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} CareerZone. Tất cả quyền được bảo lưu.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Theo dõi chúng tôi:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                      aria-label={`Theo dõi CareerZone trên ${social.name}`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;