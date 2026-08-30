import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * 根據視窗寬度回傳裝置類型：
 * - mobile:  < 768px
 * - tablet:  768px ~ 1023px
 * - desktop: >= 1024px
 */
export function useBreakpoint(): Breakpoint {
  const getBreakpoint = (): Breakpoint => {
    const w = window.innerWidth;
    if (w >= 1024) return 'desktop';
    if (w >= 768) return 'tablet';
    return 'mobile';
  };

  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getBreakpoint);

  useEffect(() => {
    let rafId: number;

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setBreakpoint(getBreakpoint());
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return breakpoint;
}
