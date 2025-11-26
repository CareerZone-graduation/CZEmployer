import { Button } from '@/components/ui/button'

import clsx from 'clsx'
import { VIETNAMESE_CONTENT } from '@/constants/vietnamese'

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
}

const Container = ({ children, className }) => (
  <div className={clsx('mx-auto max-w-7xl px-6 sm:px-8 lg:px-12', className)}>{children}</div>
)

export default function Home() {
  return (
    <div id="webcrumbs">
      <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-emerald-50 to-white text-gray-800 antialiased">
        {/* Background gradients + animated lights */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* static soft glows */}
          <div className="absolute -top-32 -left-32 h-[480px] w-[480px] rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-emerald-400/20 blur-3xl" />
          {/* animated aurora blobs */}
          <motion.div
            aria-hidden
            className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-emerald-300/30 blur-3xl"
            animate={{ x: [0, 60, -40, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl"
            animate={{ x: [0, -50, 30, 0], y: [0, 25, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
          <Container className="h-16 flex items-center justify-between">
            <a href="/" className="group flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Career<span className="text-emerald-600">Zone</span>
              </span>
            </a>
            <nav className="flex items-center gap-4 md:gap-6">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">{VIETNAMESE_CONTENT.navigation.features}</a>
              <a href="support" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">{VIETNAMESE_CONTENT.navigation.contact}</a>
              <a href="/auth/login" className="font-medium text-gray-700 hover:text-emerald-600 transition-colors">{VIETNAMESE_CONTENT.navigation.login}</a>
              <a href="/auth/register" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all duration-300">{VIETNAMESE_CONTENT.navigation.register}</a>
            </nav>
          </Container>
        </header>

        {/* Hero Section */}
        <main className="flex w-full flex-1 items-center py-16 md:py-24 lg:py-32">
          <Container>
            <div className="grid w-full grid-cols-1 items-center gap-12 md:grid-cols-2">
              <div>
                <motion.h1
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900"
                >
                  <span className="bg-gradient-to-br from-emerald-600 via-emerald-500 to-emerald-700 bg-clip-text text-transparent">Tuyển dụng chuyên nghiệp</span>
                  <br />
                  kết nối nhân tài xuất sắc
                </motion.h1>
                <motion.p
                  initial="hidden"
                  animate="show"
                  custom={1}
                  variants={fadeUp}
                  className="mt-6 max-w-xl text-base md:text-lg text-gray-600"
                >
                  Nền tảng tuyển dụng hàng đầu giúp doanh nghiệp Việt Nam tiếp cận ứng viên chất lượng cao, tối ưu hóa quy trình tuyển dụng và xây dựng đội ngũ mạnh mẽ.
                </motion.p>
                <motion.div
                  initial="hidden"
                  animate="show"
                  custom={2}
                  variants={fadeUp}
                  className="mt-8 flex flex-wrap items-center gap-4"
                >
                  <a href="/auth/register" className="group relative inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white shadow-md transition-all duration-300 hover:shadow-lg hover:bg-emerald-700">
                    {/* shine sweep */}
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute -inset-y-8 -left-10 w-10 rotate-12 bg-white/30 blur-sm transition-transform duration-700 group-hover:translate-x-[260%]" />
                    </span>
                    Bắt đầu tuyển dụng
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </a>
                  <a href="/auth/login" className="rounded-full border-2 border-emerald-600 px-6 py-3 font-medium text-emerald-600 hover:bg-emerald-50 transition-all duration-300">Tôi đã có tài khoản</a>
                </motion.div>
              </div>

              {/* Right: mockup card + auto carousel (marquee) */}
              <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                  <h3 className="text-gray-900 font-semibold mb-2">Danh sách ứng viên phù hợp</h3>
                  <p className="text-gray-500 text-sm">Được đề xuất tự động theo JD</p>
                  <div className="mt-5 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <input readOnly value="Frontend React, 2+ năm kinh nghiệm…" className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400" />
                    <button className="rounded-lg bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs text-white transition-colors">Tìm nhanh</button>
                  </div>

                  {/* Auto-scrolling tags (marquee) */}
                  <div className="mt-4 overflow-hidden">
                    <motion.div className="flex gap-2" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}>
                      {["React","Next.js","TypeScript","Tailwind","UX","REST","GraphQL","Node.js","CI/CD","AWS","Docker","Kubernetes"].map((k) => (
                        <span key={k} className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs font-medium">{k}</span>
                      ))}
                      {["React","Next.js","TypeScript","Tailwind","UX","REST","GraphQL","Node.js","CI/CD","AWS","Docker","Kubernetes"].map((k, i) => (
                        <span key={'dup-'+i} className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 text-xs font-medium">{k}</span>
                      ))}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Container>
        </main>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-24 bg-gray-50">
          <Container>
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Tính năng nổi bật</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Với CareerZone, bạn có thể tinh gọn quy trình, tiếp cận tài năng hàng đầu và xây dựng đội ngũ trong mơ.</p>
            </div>

            {/* Animated feature cards */}
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { title: 'Gợi ý ứng viên thông minh', desc: 'Thuật toán đề xuất dựa trên kỹ năng & kinh nghiệm phù hợp với JD.' },
                { title: 'Quản lý pipeline tuyển dụng', desc: 'Kéo-thả ứng viên theo giai đoạn, đánh giá nhanh và ghi chú dùng chung.' },
                { title: 'Bảo mật & tuân thủ', desc: 'Mã hóa dữ liệu, phân quyền chi tiết và tuân thủ chuẩn bảo mật.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-100" />
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{f.desc}</p>
                  <span className="pointer-events-none relative mt-4 block h-1 w-24 overflow-hidden rounded-full bg-emerald-100">
                    <span className="absolute inset-y-0 left-0 w-10 -translate-x-10 bg-emerald-400/40 blur-sm transition-transform duration-700 group-hover:translate-x-28" />
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Logo marquee (auto-scroll) */}
            <div className="mt-14 overflow-hidden">
              <motion.div className="flex gap-10 items-center opacity-80" animate={{ x: ['0%', '-50%'] }} transition={{ repeat: Infinity, duration: 35, ease: 'linear' }}>
                {['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Omega'].map((b) => (
                  <div key={b} className="shrink-0 h-10 w-28 rounded-md bg-gray-200" aria-label={`Logo ${b}`} />
                ))}
                {['Alpha','Beta','Gamma','Delta','Epsilon','Zeta','Omega'].map((b, i) => (
                  <div key={'dup-'+i} className="shrink-0 h-10 w-28 rounded-md bg-gray-200" aria-label={`Logo ${b}`} />
                ))}
              </motion.div>
            </div>
          </Container>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 md:py-24 bg-white">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:4xl font-extrabold text-gray-900">Liên hệ với chúng tôi</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">Bạn cần hỗ trợ? Hãy để lại thông tin, chúng tôi sẽ liên hệ sớm nhất.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              {/* form */}
              <form className="grid gap-4">
                <input type="text" placeholder="Họ và tên" className="rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <input type="email" placeholder="Email" className="rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <textarea placeholder="Nội dung" rows={5} className="rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none" />
                <Button className="relative bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg overflow-hidden">
                  <span>Gửi liên hệ</span>
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shine 2.5s linear infinite' }} />
                </Button>
              </form>

              {/* motion counters / stats */}
              <div className="grid gap-6">
                {[
                  { k: 'Doanh nghiệp', v: '1,200+' },
                  { k: 'Hồ sơ/tuần', v: '10k+' },
                  { k: 'Tỷ lệ phù hợp', v: '92%' },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <span className="text-gray-600">{s.k}</span>
                    <span className="text-2xl font-bold text-emerald-600">{s.v}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* CTA Banner */}
        <section className="relative overflow-hidden py-16 md:py-20">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-gray-50 via-emerald-100 to-white" />
          <Container>
            <div className="flex flex-col items-center justify-between gap-8 rounded-2xl border border-gray-200 bg-white/70 p-8 text-center text-gray-900 shadow-xl backdrop-blur-sm md:flex-row md:text-left">
              <div>
                <p className="text-sm uppercase tracking-widest text-emerald-600">Sẵn sàng nâng cấp tuyển dụng</p>
                <h2 className="mt-1 text-2xl font-bold md:text-3xl">Gia nhập CareerZone ngay hôm nay</h2>
                <p className="mt-1 text-gray-600 max-w-lg">Đưa doanh nghiệp của bạn chạm tới đúng nhân tài, đúng thời điểm.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="/auth/register" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 font-medium text-white shadow-md hover:shadow-lg hover:bg-emerald-700 transition-all duration-300">Tạo tài khoản miễn phí<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></a>
                <a href="/auth/login" className="rounded-full border-2 border-emerald-600 px-6 py-3 font-medium text-emerald-600 hover:bg-emerald-50 transition-all duration-300">Đã có tài khoản</a>
              </div>
            </div>
          </Container>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white py-6 md:py-8">
          <Container className="flex flex-col items-center justify-between gap-3 md:flex-row">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} CareerZone. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm">
              <a className="text-gray-600 hover:text-emerald-600 transition-colors" href="#">Điều khoản</a>
              <a className="text-gray-600 hover:text-emerald-600 transition-colors" href="#">Quyền riêng tư</a>
              <a className="text-gray-600 hover:text-emerald-600 transition-colors" href="#contact">Liên hệ</a>
            </div>
          </Container>
        </footer>

        {/* scoped keyframes for shine */}
        <style>{`@keyframes shine{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}`}</style>
      </div>
    </div>
  )
}
