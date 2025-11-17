import React from 'react';
import Image from 'next/image';

type Props = {
  onClick: () => void;
  imageSrc?: string;
  title: string;
  description: string;
  borderColor?: string;
  bgColor?: string;
  note?: string;
};

export default function ActionCard({
  onClick,
  imageSrc,
  title,
  description,
  borderColor = 'border-blue-200 hover:border-blue-400',
  bgColor = 'from-blue-50 to-indigo-50',
  note,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300
                 bg-white border-2 ${borderColor}
                 hover:shadow-xl hover:scale-[1.03]
                 hover:-translate-y-1 w-full aspect-square flex flex-col`}
      style={{ aspectRatio: '1/1' }}
    >
      {/* Gradient accent on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgColor} opacity-0 group-hover:opacity-30 transition-opacity duration-300`}></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        {/* Centered Image */}
        {imageSrc && (
          <div className="mb-4 group-hover:scale-110 transition-all duration-300">
            <Image
              src={imageSrc}
              alt={title}
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
        )}
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-sm text-center">{description}</p>
        {note && (
          <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-200 text-center">
            {note}
          </p>
        )}
      </div>
    </button>
  );
}
