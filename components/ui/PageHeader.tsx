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
  iconBgColor = 'from-orange-400 to-amber-500',
  titleGradient = 'from-orange-600 to-amber-600',
}: Props) {
  return (
    <header className="border-b border-orange-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {backButton ? (
            <button
              onClick={backButton.onClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl">←</span>
              <span className="text-sm font-medium">{backButton.label}</span>
            </button>
          ) : (
            <div className="w-40"></div>
          )}
          
          <div className="flex items-center gap-3">
            {icon && (
              <div className={`w-10 h-10 bg-gradient-to-br ${iconBgColor} rounded-xl flex items-center justify-center shadow-sm`}>
                <span className="text-white text-xl">{icon}</span>
              </div>
            )}
            <h1 className={`text-xl font-bold bg-gradient-to-r ${titleGradient} bg-clip-text text-transparent`}>
              {title}
            </h1>
          </div>

          {rightContent || <div className="w-40"></div>}
        </div>
      </div>
    </header>
  );
}
