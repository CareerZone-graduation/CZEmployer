import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
];

// Component thanh 3D với animation
function Bar3D({ position, height, color, label, score, isHovered, onHover }) {
  const meshRef = useRef();
  const targetHeight = height;

  useFrame(() => {
    if (meshRef.current) {
      // Smooth animation
      const currentHeight = meshRef.current.scale.y;
      const diff = targetHeight - currentHeight;
      meshRef.current.scale.y += diff * 0.1;

      // Hover effect
      if (isHovered) {
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1.2, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1.2, 0.1);
      } else {
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 1, 0.1);
      }
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        scale={[1, 0.1, 1]}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
        castShadow
      >
        <boxGeometry args={[0.8, 1, 0.8]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={isHovered ? 0.3 : 0.1}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.3, 0]}
        fontSize={0.15}
        color="#374151"
        anchorX="center"
        anchorY="middle"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        {label}
      </Text>

      {/* Score tooltip on hover */}
      {isHovered && (
        <Html position={[0, height + 0.5, 0]} center>
          <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-semibold whitespace-nowrap">
            {score.toFixed(0)} điểm
          </div>
        </Html>
      )}
    </group>
  );
}

// Grid floor
function GridFloor() {
  return (
    <gridHelper args={[10, 10, '#e5e7eb', '#f3f4f6']} position={[0, 0, 0]} />
  );
}

/**
 * Component biểu đồ 3D bar chart so sánh ứng viên
 */
const Candidate3DChart = ({ candidates = [] }) => {
  const [hoveredBar, setHoveredBar] = React.useState(null);

  // Hàm tính điểm (giống như RadarChart)
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

  const chartData = useMemo(() => {
    if (!candidates.length) return [];

    const criteria = [
      { key: 'skills', label: 'Kỹ năng' },
      { key: 'experience', label: 'Kinh nghiệm' },
      { key: 'education', label: 'Học vấn' },
      { key: 'jobFit', label: 'Phù hợp' },
      { key: 'salary', label: 'Lương' },
    ];

    const data = [];
    const spacing = 1.5;
    const groupSpacing = 0.3;

    criteria.forEach((criterion, criterionIdx) => {
      candidates.forEach((candidate, candidateIdx) => {
        const score = calculateScore(candidate, criterion.key);
        const x = criterionIdx * spacing;
        const z = candidateIdx * groupSpacing - (candidates.length * groupSpacing) / 2;

        data.push({
          position: [x, 0, z],
          height: score / 100 * 3, // Scale to 3 units max
          color: COLORS[candidateIdx % COLORS.length],
          label: candidateIdx === 0 ? criterion.label : '',
          score,
          id: `${criterionIdx}-${candidateIdx}`,
        });
      });
    });

    return data;
  }, [candidates]);

  if (!candidates.length) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        Chưa có dữ liệu để hiển thị biểu đồ 3D
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      <Canvas
        camera={{ position: [5, 4, 5], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.3} />

        <GridFloor />

        {chartData.map((bar) => (
          <Bar3D
            key={bar.id}
            position={bar.position}
            height={bar.height}
            color={bar.color}
            label={bar.label}
            score={bar.score}
            isHovered={hoveredBar === bar.id}
            onHover={(hovered) => setHoveredBar(hovered ? bar.id : null)}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-700 mb-2">Ứng viên</div>
        <div className="space-y-1">
          {candidates.map((candidate, idx) => (
            <div key={candidate._id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-xs text-gray-600">
                {candidate.candidateProfileId?.fullName || `Ứng viên ${idx + 1}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div>🖱️ Kéo để xoay</div>
          <div>🔍 Cuộn để zoom</div>
          <div>👆 Hover để xem điểm</div>
        </div>
      </div>
    </div>
  );
};

export default Candidate3DChart;
