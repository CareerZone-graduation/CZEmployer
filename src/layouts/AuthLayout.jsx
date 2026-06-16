import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarCheck2,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes('/register');

  const insights = [
    { label: 'Ứng viên mới', value: '128', tone: 'bg-emerald-500' },
    { label: 'Lịch phỏng vấn', value: '24', tone: 'bg-sky-500' },
    { label: 'Hồ sơ phù hợp', value: '86%', tone: 'bg-amber-500' },
  ];

  const benefits = [
    'Sàng lọc ứng viên bằng AI theo tiêu chí tuyển dụng',
    'Quản lý pipeline, phỏng vấn và bài test trong một nơi',
    'Bảo mật dữ liệu doanh nghiệp và lịch sử tương tác',
  ];

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f6faf8] px-4 py-6 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-sky-300/30 blur-3xl" />

      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="h-10 gap-2 rounded-full border-slate-200 bg-white/85 px-4 font-semibold text-slate-700 shadow-sm backdrop-blur hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Trang chủ
        </Button>
      </div>

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-[620px] flex-col justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="mb-9 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-slate-950">
                Career<span className="text-emerald-600">Zone</span>
              </p>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Recruiter Workspace
              </p>
            </div>
          </div>

          <div className="w-full">
            <Outlet />
          </div>

          <p className="mt-8 text-center text-xs leading-6 text-slate-500">
            Khi tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="font-semibold text-emerald-700 hover:underline">
              Điều khoản dịch vụ
            </a>{' '}
            và{' '}
            <a href="#" className="font-semibold text-emerald-700 hover:underline">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>

        <aside className="relative hidden min-h-[620px] overflow-hidden bg-slate-950 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(14,165,233,0.28),transparent_28%),linear-gradient(135deg,#07110f_0%,#0f172a_55%,#06251d_100%)]" />
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              {isRegister ? 'Thiết lập workspace trong vài phút' : 'Quay lại trung tâm tuyển dụng'}
            </div>

            <div className="space-y-8">
              <div className="max-w-md space-y-4">
                <h1 className="text-4xl font-black leading-tight tracking-tight">
                  {isRegister
                    ? 'Bắt đầu xây dựng pipeline tuyển dụng rõ ràng hơn.'
                    : 'Tiếp tục quản lý tuyển dụng với dữ liệu tập trung.'}
                </h1>
                <p className="text-base leading-7 text-slate-300">
                  CareerZone giúp nhà tuyển dụng theo dõi ứng viên, lịch phỏng vấn,
                  bài đánh giá và gợi ý AI trong một không gian làm việc thống nhất.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/20 backdrop-blur">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-sm text-slate-400">Tổng quan hôm nay</p>
                    <p className="text-lg font-bold">Recruitment Board</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200">
                    <UsersRound className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {insights.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                      <div className={`mb-3 h-1.5 w-8 rounded-full ${item.tone}`} />
                      <p className="text-2xl font-black">{item.value}</p>
                      <p className="mt-1 text-xs leading-4 text-slate-300">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <CalendarCheck2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Phỏng vấn Frontend Lead</p>
                        <p className="text-xs text-slate-500">14:30 hôm nay</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                      Sẵn sàng
                    </span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-100">
                      <LockKeyhole className="h-4 w-4 text-amber-300" />
                      Dữ liệu doanh nghiệp được bảo vệ
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <div className="h-2 w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-sky-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm font-semibold text-slate-200">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default AuthLayout;

