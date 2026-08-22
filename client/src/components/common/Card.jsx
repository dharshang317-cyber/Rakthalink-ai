import React from 'react';

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  footer,
  hover = false,
  glass = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 transition-all duration-200 ${
        glass ? 'bg-white/80 backdrop-blur-md' : 'bg-white'
      } ${hover ? 'hover:shadow-md hover:border-slate-300' : 'shadow-xs'} ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-base font-['Outfit']">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 rounded-b-2xl">{footer}</div>}
    </div>
  );
}
