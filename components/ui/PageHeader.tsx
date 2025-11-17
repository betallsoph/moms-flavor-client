import React from 'react';

type Props = {
  icon?: string;
  title: string;
  backButton?: {
    label: string;
    onClick: () => void;
  };
  rightContent?: React.ReactNode;
  iconBgColor?: string;
  titleGradient?: string;
};

export default function PageHeader({
  icon,
  title,
  backButton,
  rightContent,
  iconBgColor,
  titleGradient,
}: Props) {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {backButton ? (
            <button
              onClick={backButton.onClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">{backButton.label}</span>
            </button>
          ) : (
            <div className="w-40"></div>
          )}

          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-2xl">{icon}</span>
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
          </div>

          {rightContent || <div className="w-40"></div>}
        </div>
      </div>
    </header>
  );
}
