import React, { useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>; // Enforce a single element to apply ARIA attributes
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const tooltipId = useId();

  // Clone the child to add the aria-describedby attribute for accessibility
  const trigger = React.cloneElement(children, {
    'aria-describedby': tooltipId,
  });

  return (
    <span className="relative group inline-block">
      {trigger}
      <div 
        id={tooltipId}
        role="tooltip"
        className="absolute bottom-full mb-2 w-64 bg-slate-900 text-white text-sm rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-10 border border-slate-700 transform -translate-x-1/2 left-1/2"
      >
        {content}
      </div>
    </span>
  );
};
