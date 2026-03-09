import { useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
];

/**
 * Component hiển thị biểu đồ radar từ AI scores
 */
const AIScoresRadarChart = ({ aiScores }) => {
  const chartData = useMemo(() => {
    if (!aiScores || !aiScores.candidates) return [];

    const criteria = [
      { key: 'skills', label: 'Kỹ năng' },
      { key: 'experience', label: 'Kinh nghiệm' },
      { key: 'education', label: 'Học vấn' },
      { key: 'jobFit', label: 'Phù hợp JD' },
      { key: 'salary', label: 'Mức lương' },
    ];

    return criteria.map(criterion => {
      const dataPoint = { criterion: criterion.label };

      aiScores.candidates.forEach((candidate) => {
        const score = candidate.scores[criterion.key] || 0;
        dataPoint[candidate.name] = score;
      });

      return dataPoint;
    });
  }, [aiScores]);

  if (!aiScores || !aiScores.candidates || !aiScores.candidates.length) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="criterion"
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af', fontSize: 10 }}
          />
          {aiScores.candidates.map((candidate, idx) => (
            <Radar
              key={candidate.applicationId}
              name={candidate.name}
              dataKey={candidate.name}
              stroke={COLORS[idx % COLORS.length]}
              fill={COLORS[idx % COLORS.length]}
              fillOpacity={0.3}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {aiScores.candidates.map((candidate, idx) => (
          <div
            key={candidate.applicationId}
            className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
            style={{
              borderColor: COLORS[idx % COLORS.length],
              backgroundColor: `${COLORS[idx % COLORS.length]}10`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
              <div
                className="px-3 py-1 rounded-full text-white font-bold text-sm"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              >
                {candidate.totalScore.toFixed(0)} điểm
              </div>
            </div>
            <div className="space-y-2">
              {Object.entries(candidate.scores).map(([key, score]) => {
                const labels = {
                  skills: 'Kỹ năng',
                  experience: 'Kinh nghiệm',
                  education: 'Học vấn',
                  jobFit: 'Phù hợp JD',
                  salary: 'Mức lương',
                };
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{labels[key]}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${score}%`,
                            backgroundColor: COLORS[idx % COLORS.length],
                          }}
                        />
                      </div>
                      <span className="font-semibold text-gray-700 w-8 text-right">
                        {score}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Reasoning */}
            {candidate.reasoning && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  <strong>Lý do chấm điểm:</strong>
                </p>
                <ul className="text-xs text-gray-600 mt-1 space-y-1">
                  {Object.entries(candidate.reasoning).map(([key, reason]) => (
                    <li key={key}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIScoresRadarChart;
