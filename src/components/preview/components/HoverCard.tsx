import React, { useState, useEffect, useRef } from 'react';
import { ResourceCard } from './ResourceCard';

interface HoverCardProps {
  resources: any[];
  position?: 'top' | 'bottom';
}

export function HoverCard({ resources, position = 'bottom' }: HoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();
  const minDisplayTimeRef = useRef<number>();
  const cardRef = useRef<HTMLDivElement>(null);

  // Cleanup function for timeouts
  const clearTimeouts = () => {
    if (showTimeoutRef.current) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
  };

  useEffect(() => {
    // Show card with delay
    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      minDisplayTimeRef.current = Date.now() + 2000; // 2 seconds minimum display time
    }, 200);

    return () => {
      clearTimeouts();
    };
  }, []);

  const handleMouseEnter = () => {
    clearTimeouts();
    setIsVisible(true);
    minDisplayTimeRef.current = Date.now() + 2000; // Reset minimum display time
  };

  const handleMouseLeave = () => {
    const now = Date.now();
    const minDisplayTime = minDisplayTimeRef.current || 0;
    const remainingTime = Math.max(0, minDisplayTime - now);

    clearTimeouts();
    
    // Schedule hiding after minimum display time
    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, remainingTime);
  };

  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      ref={cardRef}
      className={`absolute ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 z-50 bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[300px] max-w-lg`}
      style={{ maxHeight: '80vh', overflowY: 'auto' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="space-y-4">
        {resources.map((resource, idx) => (
          <div key={idx} className="relative">
            {resource.wlo_metadata && (
              Array.isArray(resource.wlo_metadata) 
                ? resource.wlo_metadata.map((metadata, metaIdx) => (
                    <div key={`${idx}-${metaIdx}`} className="mb-4 last:mb-0">
                      <ResourceCard 
                        resource={{...resource, metadata}} 
                      />
                    </div>
                  ))
                : <ResourceCard 
                    resource={{...resource, metadata: resource.wlo_metadata}}
                  />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}