import React, { useId } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement<any>; // Enforce a single element to apply ARIA attributes
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const tooltipId = useId();

  // Clone the child to add the necessary ARIA attribute for accessibility.
  const clonedChild = React.cloneElement(children, {
    ...children.props,
    'aria-describedby': tooltipId,
  });
  
  return (
    <span className="relative group inline-block">
      {clonedChild}
      <div 
        id={tooltipId}
        role="tooltip"
        // The tooltip's visibility is now controlled purely by CSS group-hover and group-focus-within,
        // making it more reliable, accessible, and aligned with standard web patterns.
        className="absolute bottom-full mb-3 w-64 text-[hsl(var(--text-secondary))] text-sm p-3 shadow-lg z-10 transform -translate-x-1/2 left-1/2 
                   translate-y-1 opacity-0 pointer-events-none 
                   transition-all duration-200 
                   group-hover:opacity-100 group-hover:translate-y-0 
                   group-focus-within:opacity-100 group-focus-within:translate-y-0
                   tooltip-container"
      >
        {content}
      </div>
    </span>
  );
};
