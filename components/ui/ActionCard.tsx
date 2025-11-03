import React from 'react';

type Props = {
  onClick: () => void;
  icon: string;
  decorIcon?: string;
  title: string;
  description: string;
  borderColor?: string;
  bgColor?: string;
  note?: string;
};

export default function ActionCard({
  onClick,
  icon,
  decorIcon,
  title,
  description,
  borderColor = 'border-orange-200 hover:border-orange-400',
  bgColor = 'from-orange-100 to-amber-100',
  note,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`group bg-white rounded-xl shadow-md hover:shadow-lg border ${borderColor} transition-all p-8`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {decorIcon && (
          <div className="text-3xl group-hover:scale-125 transition-transform">{decorIcon}</div>
        )}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      {note && (
        <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
          {note}
        </p>
      )}
    </button>
  );
}
