import React from 'react';

const MetricCard = ({ title, value, subtitle, icon, trend, color = "blue" }) => {
    const colorClass = {
        blue: "bg-gradient-to-r from-blue-500 to-blue-600",
        green: "bg-gradient-to-r from-green-500 to-green-600",
        yellow: "bg-gradient-to-r from-yellow-500 to-yellow-600",
        red: "bg-gradient-to-r from-red-500 to-red-600",
        purple: "bg-gradient-to-r from-purple-500 to-purple-600"
    }[color];

    return (
        <div className="metric-card glass-card rounded-2xl p-6 shadow-lg">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                {icon && (
                    <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center text-white text-xl`}>
                        {icon}
                    </div>
                )}
            </div>
            {trend !== undefined && (
                <div className="mt-4">
                    <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            trend >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {trend >= 0 ? `↗ +${trend.toFixed(1)}%` : `↘ ${trend.toFixed(1)}%`}
                    </span>
                </div>
            )}
        </div>
    );
};

export default MetricCard;
