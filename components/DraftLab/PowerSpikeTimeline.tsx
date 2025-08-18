import React from 'react';
import { Tooltip } from '../common/Tooltip';
import type { TeamAnalysis } from '../../types';

interface PowerSpikeTimelineProps {
    timeline: NonNullable<TeamAnalysis['powerSpikeTimeline']>;
}

export const PowerSpikeTimeline: React.FC<PowerSpikeTimelineProps> = ({ timeline }) => {
    return (
        <div className="p-4 bg-slate-900/50 rounded-lg">
            <div className="flex justify-between items-end h-32" aria-label="Power Spike Timeline">
                {timeline.map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                        <Tooltip content={
                            <div className="text-center">
                                <p className="font-bold">{point.time}</p>
                                <p>{point.event}</p>
                            </div>
                        }>
                            <div className="flex items-end h-full w-full justify-center gap-1">
                                <div 
                                    className="bar-grow w-1/2 bg-blue-500 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400"
                                    style={{ 
                                        height: `${point.bluePower * 10}%`,
                                        animationDelay: `${index * 100}ms`
                                    }}
                                    aria-label={`Blue Team Power: ${point.bluePower}/10 at ${point.time}`}
                                />
                                <div 
                                    className="bar-grow w-1/2 bg-red-500 rounded-t-sm transition-all duration-300 group-hover:bg-red-400"
                                    style={{ 
                                        height: `${point.redPower * 10}%`,
                                        animationDelay: `${index * 100 + 50}ms`
                                    }}
                                     aria-label={`Red Team Power: ${point.redPower}/10 at ${point.time}`}
                                />
                            </div>
                        </Tooltip>
                        <span className="text-xs text-gray-400 mt-1 absolute -bottom-4">{point.time.split(' ')[0]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
