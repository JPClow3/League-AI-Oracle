

import React from 'react';
import { BLUEPRINTS } from '../../constants';
import type { Blueprint } from '../../constants';
import { Button } from '../common/Button';

interface BlueprintPanelProps {
    onLoad: (championIds: string[]) => void;
}

const BlueprintCard = ({ blueprint, onLoad }: { blueprint: Blueprint, onLoad: (championIds: string[]) => void; }) => {
    return (
        <div className="bg-bg-secondary p-4 shadow-sm flex flex-col justify-between h-full border border-border-primary">
            <div>
                <h4 className="font-semibold text-lg text-text-primary">{blueprint.name}</h4>
                <p className="text-sm text-text-secondary mt-1">{blueprint.description}</p>
            </div>
            <Button onClick={() => onLoad(blueprint.championIds)} variant="secondary" className="w-full mt-4">
                Load Blueprint
            </Button>
        </div>
    );
};


export const BlueprintPanel = ({ onLoad }: BlueprintPanelProps) => {
    return (
        <div className="bg-bg-secondary p-4 shadow-sm border border-border-primary">
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-4">Composition Blueprints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {BLUEPRINTS.map(bp => (
                    <React.Fragment key={bp.name}>
                      <BlueprintCard blueprint={bp} onLoad={onLoad} />
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};