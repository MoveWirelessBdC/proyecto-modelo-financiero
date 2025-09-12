import React from 'react';

const RiskGauge = ({ value, low, high, title }) => {
    const percentage = Math.min(Math.max(value, 0), 100);
    let color = '#10b981';
    let riskLevel = 'Bajo';

    if (percentage >= low && percentage < high) {
        color = '#f59e0b';
        riskLevel = 'Medio';
    } else if (percentage >= high) {
        color = '#ef4444';
        riskLevel = 'Alto';
    }

    return (
        <div className="glass-card p-6 rounded-2xl text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                    />
                    <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={`${percentage} 100`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold">{`${percentage.toFixed(1)}%`}</span>
                    <span className="text-xs text-gray-500">{riskLevel}</span>
                </div>
            </div>
        </div>
    );
};

export default RiskGauge;
