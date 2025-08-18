

import React from 'react';
import { BLUEPRINTS } from '../../constants';
import type { Blueprint } from '../../constants';
import { Button } from '../common/Button';

interface BlueprintPanelProps {
    onLoad: (championIds: string[]) => void;
}

const BlueprintCard: React.FC<{ blueprint: Blueprint, onLoad: (championIds: string[]) => void; }> = ({ blueprint, onLoad }) => {
    return (
        <div className="bg-slate-800/70 p-4 rounded-lg shadow-lg flex flex-col justify-between h-full">
            <div>
                <h4 className="font-bold text-lg text-blue-300">{blueprint.name}</h4>
                <p className="text-sm text-slate-400 mt-1">{blueprint.description}</p>
            </div>
            <Button onClick={() => onLoad(blueprint.championIds)} variant="secondary" className="w-full mt-4">
                Load Blueprint
            </Button>
        </div>
    );
};


export const BlueprintPanel: React.FC<BlueprintPanelProps> = ({ onLoad }) => {
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg shadow-lg">
            <h2 className="font-display text-2xl font-semibold text-slate-200 mb-4">Composition Blueprints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {BLUEPRINTS.map(bp => (
                    <BlueprintCard key={bp.name} blueprint={bp} onLoad={onLoad} />
                ))}
            </div>
        </div>
    );
};