import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts';
import { useState } from 'react';

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
];

// Hàm tính điểm cho từng tiêu chí
const calculateScore = (candidate, criterionKey) => {
  const profile = candidate.candidateProfileId;
  if (!profile) return 0;

  switch (criterionKey) {
    case 'skills':
      const skills = profile.skills || [];
      if (!skills.length) return 0;
      const avgLevel = skills.reduce((sum, s) => {
        const levelScore = { 'Beginner': 25, 'Intermediate': 50, 'Advanced': 75, 'Expert': 100 };
        return sum + (levelScore[s.level] || 50);
      }, 0) / skills.length;
      return Math.min(100, avgLevel);

    case 'experience':
      const experiences = profile.experiences || [];
      if (!experiences.length) return 0;
      const totalMonths = experiences.reduce((sum, exp) => {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const months = (end - start) / (1000 * 60 * 60 * 24 * 30);
        return sum + months;
      }, 0);
      const years = totalMonths / 12;
      return Math.min(100, (years / 7) * 100);

    case 'education':
      const educations = profile.educations || [];
      if (!educations.length) return 0;
      const degreeScore = { 'Trung cấp': 40, 'Cao đẳng': 50, 'Cử nhân': 70, 'Thạc sĩ': 85, 'Tiến sĩ': 100 };
      const maxDegree = Math.max(...educations.map(e => degreeScore[e.degree] || 60));
      const avgGPA = educations.filter(e => e.gpa).reduce((sum, e) => sum + parseFloat(e.gpa), 0) / educations.filter(e => e.gpa).length;
      const gpaBonus = avgGPA ? (avgGPA / 4) * 20 : 0;
      return Math.min(100, maxDegree + gpaBonus);

    case 'jobFit':
      const statusScore = {
        'PENDING': 40,
        'SUITABLE': 80,
        'SCHEDULED_INTERVIEW': 85,
        'OFFER_SENT': 90,
        'ACCEPTED': 95,
        'REJECTED': 20,
      };
      let score = statusScore[candidate.status] || 50;
      if (candidate.coverLetter && candidate.coverLetter.length > 100) score += 10;
      return Math.min(100, score);

    case 'salary':
      const expectedSalary = profile.expectedSalary;
      if (!expectedSalary || !expectedSalary.min) return 50;
      const jobMin = 10000000;
      const jobMax = 30000000;
      const candidateMin = expectedSalary.min;
      if (candidateMin < jobMin) return 100;
      if (candidateMin > jobMax) return 30;
      const ratio = (candidateMin - jobMin) / (jobMax - jobMin);
      return Math.max(30, 100 - (ratio * 70));

    default:
      return 50;
  }
};

// Active shape for hover effect
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-bold text-lg">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#666" className="text-sm">
        {value.toFixed(0)} điểm
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
    </g>
  );
};

/**
 * Component biểu đồ vòng tròn (donut chart) so sánh ứng viên
 */
const CandidateCircularChart = ({ candidates = [] }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(() => {
    if (!candidates.length) return [];

    const criteria = [
      { key: 'skills', label: 'Kỹ năng' },
      { key: 'experience', label: 'Kinh nghiệm' },
      { key: 'education', label: 'Học vấn' },
      { key: 'jobFit', label: 'Phù hợp JD' },
      { key: 'salary', label: 'Mức lương' },
    ];

    return candidates.map((candidate, idx) => {
      const scores = criteria.map(c => calculateScore(candidate, c.key));
      const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

      return {
        name: candidate.candidateProfileId?.fullName || `Ứng viên ${idx + 1}`,
        value: avgScore,
        color: COLORS[idx % COLORS.length],
        details: criteria.map((c, i) => ({ label: c.label, score: scores[i] })),
      };
    });
  }, [candidates]);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  if (!candidates.length) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        Chưa có dữ liệu để hiển thị biểu đồ
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="font-semibold text-gray-800">{payload[0].name}</p>
                        <p className="text-sm text-gray-600">
                          Điểm trung bình: <span className="font-bold">{payload[0].value.toFixed(1)}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800 mb-4">Chi tiết điểm số</h3>
          {chartData.map((candidate, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: candidate.color,
                backgroundColor: `${candidate.color}10`,
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                <div
                  className="px-3 py-1 rounded-full text-white font-bold text-sm"
                  style={{ backgroundColor: candidate.color }}
                >
                  {candidate.value.toFixed(0)} điểm
                </div>
              </div>
              <div className="space-y-2">
                {candidate.details.map((detail, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{detail.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${detail.score}%`,
                            backgroundColor: candidate.color,
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-700 w-8 text-right">
                        {detail.score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateCircularChart;
