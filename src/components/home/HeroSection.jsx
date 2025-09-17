import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Shield, CheckCircle } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { VIETNAMESE_CONTENT, PROFESSIONAL_CONTENT } from '@/constants/vietnamese';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 * i,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();
  
  const trustIndicators = [
    {
      icon: Users,
      value: "500+",
      label: "Doanh nghiệp hàng đầu tin tưởng"
    },
    {
      icon: TrendingUp,
      value: "50,000+",
      label: "Ứng viên chất lượng cao"
    },
    {
      icon: Shield,
      value: "95%",
      label: "Tỷ lệ tuyển dụng thành công"
    }
  ];

  const features = [
    "Công nghệ AI thông minh sàng lọc ứng viên",
    "Quy trình tuyển dụng được tối ưu hóa",
    "Bảo mật dữ liệu cấp doanh nghiệp",
    "Hỗ trợ khách hàng chuyên nghiệp 24/7"
  ];

  return (
    <section 
      className="relative min-h-screen flex items-center py-16 md:py-24 lg:py-32 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Background gradients */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-400/20 blur-3xl" />
        {!prefersReducedMotion && (
          <>
            <motion.div
              aria-hidden="true"
              className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl"
              animate={{ x: [0, 60, -40, 0], y: [0, -30, 20, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden="true"
              className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
              animate={{ x: [0, -50, 30, 0], y: [0, 25, -20, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 w-full">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Trust Badge */}
            <MotionWrapper
              variants={fadeUp}
              className="flex items-center gap-2"
            >
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                {PROFESSIONAL_CONTENT.hero.trustBadge}
              </Badge>
            </MotionWrapper>

            {/* Main Headline */}
            <MotionWrapper
              variants={fadeUp}
              custom={1}
            >
              <h1 
                id="hero-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900"
              >
                <span className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                  Nền tảng tuyển dụng
                </span>
                <br />
                <span className="text-gray-900">
                  chuyên nghiệp cho doanh nghiệp Việt Nam
                </span>
              </h1>
            </MotionWrapper>

            {/* Subheading */}
            <MotionWrapper
              variants={fadeUp}
              custom={2}
            >
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                {PROFESSIONAL_CONTENT.hero.subtitle}
              </p>
            </MotionWrapper>

            {/* Feature List */}
            <MotionWrapper
              variants={fadeUp}
              custom={3}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium">{feature}</span>
                </div>
              ))}
            </MotionWrapper>

            {/* CTA Buttons */}
            <MotionWrapper
              variants={fadeUp}
              custom={4}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <Button 
                size="lg" 
                className="group relative bg-emerald-600 hover:bg-emerald-700 focus:bg-emerald-700 text-white px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl focus:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                asChild
              >
                <a href="/auth/register" aria-describedby="cta-description">
                  <span className="absolute inset-0 overflow-hidden rounded-md" aria-hidden="true">
                    <span className="absolute -inset-y-8 -left-10 w-10 rotate-12 bg-white/30 blur-sm transition-transform duration-700 group-hover:translate-x-[260%]" />
                  </span>
                  Dùng thử miễn phí 14 ngày
                </a>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:bg-emerald-50 px-8 py-4 text-base font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                asChild
              >
                <a href="#features">
                  Xem demo sản phẩm
                </a>
              </Button>
              
              <div id="cta-description" className="sr-only">
                Đăng ký tài khoản miễn phí để trải nghiệm đầy đủ tính năng của CareerZone trong 14 ngày. Không cần thẻ tín dụng, thiết lập nhanh chóng trong 5 phút.
              </div>
            </MotionWrapper>

            {/* Trust Indicators */}
            <motion.div
              initial="hidden"
              animate="show"
              custom={5}
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-200"
            >
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <indicator.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{indicator.value}</div>
                    <div className="text-sm text-gray-600">{indicator.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.8 }}
            className="relative lg:pl-8"
          >
            {/* Main Dashboard Mockup */}
            <div className="relative">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bảng điều khiển tuyển dụng</h3>
                  <Badge className="bg-emerald-100 text-emerald-700">Đang hoạt động</Badge>
                </div>
                
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <input 
                      readOnly 
                      value="Lập trình viên Frontend React, 2+ năm kinh nghiệm..." 
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" 
                    />
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Tìm ứng viên
                    </Button>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-3">
                    {[
                      { name: "Nguyễn Văn A", role: "Lập trình viên Frontend Senior", match: "95%" },
                      { name: "Trần Thị B", role: "Chuyên viên React", match: "88%" },
                      { name: "Lê Minh C", role: "Lập trình viên Full-stack", match: "82%" }
                    ].map((candidate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-emerald-700">
                              {candidate.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{candidate.name}</div>
                            <div className="text-xs text-gray-600">{candidate.role}</div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                          {candidate.match}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Skills Tags */}
                  <div className="overflow-hidden">
                    <motion.div 
                      className="flex gap-2" 
                      animate={{ x: ['0%', '-50%'] }} 
                      transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
                    >
                      {["React", "Next.js", "TypeScript", "Tailwind", "Node.js", "GraphQL", "AWS", "Docker"].map((skill) => (
                        <Badge key={skill} variant="outline" className="shrink-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {["React", "Next.js", "TypeScript", "Tailwind", "Node.js", "GraphQL", "AWS", "Docker"].map((skill, i) => (
                        <Badge key={`dup-${i}`} variant="outline" className="shrink-0 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -right-4 -bottom-4 bg-white rounded-xl border border-gray-200 p-4 shadow-lg"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">2.5x</div>
                  <div className="text-xs text-gray-600">Nhanh hơn trong tuyển dụng</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;