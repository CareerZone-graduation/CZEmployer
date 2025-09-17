import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Shield, 
  CheckCircle, 
  Lock,
  Globe,
  Star,
  Building2,
  Zap
} from 'lucide-react';
import TestimonialCard from './TestimonialCard';
import MetricsCounter from './MetricsCounter';
import CompanyLogo from './CompanyLogo';
import TrustBadge from './TrustBadge';

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

const SocialProofSection = () => {
  // Sample testimonials data
  const testimonials = [
    {
      name: "Nguyễn Văn Minh",
      position: "Giám đốc Nhân sự",
      company: "TechViet Solutions",
      content: "CareerZone đã giúp chúng tôi tiết kiệm 60% thời gian tuyển dụng và tìm được những ứng viên chất lượng cao. Giao diện thân thiện và tính năng AI thông minh thực sự ấn tượng.",
      avatar: "/placeholder-user.jpg",
      rating: 5
    },
    {
      name: "Trần Thị Hương",
      position: "HR Manager",
      company: "Digital Innovation Co.",
      content: "Từ khi sử dụng CareerZone, quy trình tuyển dụng của chúng tôi trở nên chuyên nghiệp và hiệu quả hơn rất nhiều. Đặc biệt là tính năng phân tích và báo cáo chi tiết.",
      avatar: "/placeholder-user.jpg",
      rating: 5
    },
    {
      name: "Lê Hoàng Nam",
      position: "Recruitment Lead",
      company: "StartupHub Vietnam",
      content: "Nền tảng tuyệt vời cho các startup như chúng tôi. CareerZone không chỉ giúp tìm ứng viên mà còn hỗ trợ xây dựng thương hiệu tuyển dụng chuyên nghiệp.",
      avatar: "/placeholder-user.jpg",
      rating: 5
    }
  ];

  // Metrics data
  const metrics = [
    {
      icon: Building2,
      value: "500",
      suffix: "+",
      label: "Doanh nghiệp tin tưởng"
    },
    {
      icon: Users,
      value: "50000",
      suffix: "+",
      label: "Ứng viên chất lượng"
    },
    {
      icon: TrendingUp,
      value: "95",
      suffix: "%",
      label: "Tỷ lệ tuyển dụng thành công"
    },
    {
      icon: Zap,
      value: "60",
      suffix: "%",
      label: "Tiết kiệm thời gian"
    }
  ];

  // Company logos (placeholder data)
  const companies = [
    { name: "TechViet Solutions", logo: null },
    { name: "Digital Innovation", logo: null },
    { name: "StartupHub Vietnam", logo: null },
    { name: "VietnamWorks", logo: null },
    { name: "FPT Software", logo: null },
    { name: "Vietcombank", logo: null }
  ];

  // Trust indicators
  const trustBadges = [
    {
      icon: Shield,
      title: "Bảo mật ISO 27001",
      description: "Tiêu chuẩn bảo mật quốc tế",
      variant: "security"
    },
    {
      icon: CheckCircle,
      title: "GDPR Compliant",
      description: "Tuân thủ quy định bảo vệ dữ liệu",
      variant: "compliance"
    },
    {
      icon: Award,
      title: "Top HR Platform 2024",
      description: "Giải thưởng công nghệ HR",
      variant: "certification"
    },
    {
      icon: Lock,
      title: "SSL Encryption",
      description: "Mã hóa dữ liệu 256-bit",
      variant: "security"
    }
  ];

  return (
    <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
          >
            <Star className="w-4 h-4" />
            Được tin tưởng bởi hàng nghìn doanh nghiệp
          </motion.div>

          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Hàng nghìn doanh nghiệp đã{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
              tin tưởng CareerZone
            </span>
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={2}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Từ startup đến tập đoàn lớn, CareerZone đang giúp các doanh nghiệp Việt Nam 
            xây dựng đội ngũ mạnh mẽ và tối ưu hóa quy trình tuyển dụng.
          </motion.p>
        </div>

        {/* Metrics Section */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
        >
          {metrics.map((metric, index) => (
            <MetricsCounter
              key={index}
              icon={metric.icon}
              value={metric.value}
              suffix={metric.suffix}
              label={metric.label}
              index={index}
            />
          ))}
        </motion.div>

        {/* Testimonials Section */}
        <div className="mb-20">
          <motion.h3
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Khách hàng nói gì về CareerZone
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                name={testimonial.name}
                position={testimonial.position}
                company={testimonial.company}
                content={testimonial.content}
                avatar={testimonial.avatar}
                rating={testimonial.rating}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Company Logos Section */}
        <div className="mb-20">
          <motion.h3
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xl font-semibold text-gray-700 text-center mb-8"
          >
            Được tin tưởng bởi các doanh nghiệp hàng đầu
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <CompanyLogo
                key={index}
                name={company.name}
                logo={company.logo}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges Section */}
        <div>
          <motion.h3
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-12"
          >
            Bảo mật và tuân thủ
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => (
              <TrustBadge
                key={index}
                icon={badge.icon}
                title={badge.title}
                description={badge.description}
                variant={badge.variant}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;