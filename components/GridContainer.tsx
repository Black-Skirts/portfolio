
import React from 'react';

interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const GridContainer: React.FC<GridContainerProps> = ({ children, className = "" }) => {
  // Exact alignment with provided breakpoints:
  // <=767px: margin 16px (px-[16px])
  // 768–1023px: margin 24px (px-[24px])
  // 1024–1439px: margin 32px (px-[32px])
  // >=1440px: margin 40px (px-[40px])
  return (
    <div className={`mx-auto w-full px-[16px] md:px-[24px] lg:px-[32px] min-[1440px]:px-[40px] ${className}`}>
      {children}
    </div>
  );
};
