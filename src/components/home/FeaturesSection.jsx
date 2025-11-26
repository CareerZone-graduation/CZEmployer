// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Users, BarChart, Shield, Target, Clock, Award } from 'lucide-react';
import FeatureCard from './FeatureCard';
import { PROFESSIONAL_CONTENT } from '@/constants/vietnamese';
import { cn } from '@/lib/utils';

const FeaturesSection = () => {
  const sectionVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // Enhanced professional Vietnamese content for HR terminology
  const features = [
    {
      icon: Users,
      title: "Quản lý ứng viên thông minh",
      description: "Hệ thống AI tiên tiến với thuật toán machine learning giúp sàng lọc và đề xuất ứng viên phù hợp nhất. Tự động phân loại CV theo kỹ năng, kinh nghiệm và xếp hạng ứng viên dựa trên độ phù hợp với job description."
    },
    {
      icon: BarChart,
      title: "Báo cáo và phân tích chuyên sâu",
      description: "Dashboard analytics toàn diện với real-time reporting về hiệu quả tuyển dụng. Theo dõi KPIs quan trọng như time-to-hire, cost-per-hire, source effectiveness và candidate quality score."
    },
    {
      icon: Shield,
      title: "Bảo mật và tuân thủ pháp luật",
      description: "Đảm bảo an toàn dữ liệu với mã hóa AES-256, ISO 27001 compliance và tuân thủ đầy đủ Luật An toàn thông tin mạng và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân."
    },
    {
      icon: Target,
      title: "Tuyển dụng có mục tiêu",
      description: "Advanced search engine với Boolean logic, semantic matching và AI-powered candidate recommendations. Targeting chính xác dựa trên skills matrix, cultural fit assessment và career trajectory analysis."
    },
    {
      icon: Clock,
      title: "Quy trình được tối ưu hóa",
      description: "End-to-end recruitment automation từ job posting multi-channel đến automated screening, interview scheduling và offer management. Giảm 70% thời gian tuyển dụng và tăng 85% hiệu quả HR operations."
    },
    {
      icon: Award,
      title: "Đánh giá ứng viên chuyên nghiệp",
      description: "Comprehensive assessment platform với technical skill testing, behavioral interview tools, video interviewing và 360-degree evaluation system. Objective scoring với competency-based evaluation framework."
    }
  ];

  return (
    <section id="features" className="relative py-20 md:py-28 lg:py-36 bg-gradient-to-br from-gray-50/80 via-white to-emerald-50/30 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.03),transparent_50%)] pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
          className="space-y-16"
        >
          {/* Enhanced Section Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <motion.div variants={titleVariants}>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-sm font-semibold rounded-full mb-6 border border-emerald-200/50 shadow-sm">
                <Award className="h-4 w-4" />
                Tính năng nổi bật
              </span>
            </motion.div>
            
            <motion.h2 
              variants={titleVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight"
            >
              {PROFESSIONAL_CONTENT.features.title.split(' ').slice(0, 2).join(' ')}{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
                {PROFESSIONAL_CONTENT.features.title.split(' ').slice(2).join(' ')}
              </span>
            </motion.h2>
            
            <motion.p 
              variants={titleVariants}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto font-light"
            >
              {PROFESSIONAL_CONTENT.features.subtitle}
            </motion.p>
            
            {/* Professional stats or trust indicators */}
            <motion.div 
              variants={titleVariants}
              className="flex flex-wrap justify-center items-center gap-8 pt-4 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>500+ Doanh nghiệp tin tưởng</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>99.9% Uptime guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>ISO 27001 Certified</span>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Features Grid with improved responsive layout */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      delay: 0.1 * index,
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
                className={cn(
                  "flex",
                  // Ensure consistent heights across grid items
                  index < 3 ? "md:col-span-1" : "md:col-span-1",
                  // Special layout for better visual balance
                  index === 0 ? "xl:col-span-1" : "",
                  index === 1 ? "xl:col-span-1" : "",
                  index === 2 ? "xl:col-span-1" : "",
                )}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  index={index}
                  className="w-full h-full"
                />
              </motion.div>
            ))}
          </div>

          {/* Enhanced Bottom CTA */}
          <motion.div 
            variants={titleVariants}
            className="text-center pt-12 space-y-8"
          >
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl text-gray-700 font-medium">
                Khám phá thêm nhiều tính năng mạnh mẽ khác của CareerZone
              </p>
              <p className="text-gray-600">
                Được thiết kế đặc biệt cho thị trường tuyển dụng Việt Nam với đầy đủ tính năng chuyên nghiệp
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Dùng thử miễn phí
                <motion.div
                  className="flex items-center"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.a>
              
              <motion.a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-4 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors duration-200 group border-2 border-emerald-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50"
                whileHover={{ scale: 1.02 }}
              >
                Xem demo sản phẩm
                <Clock className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" />
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;