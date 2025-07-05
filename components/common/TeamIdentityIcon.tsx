import React from 'react';

interface TeamIdentityIconProps {
  identity: string;
}

const getIconForIdentity = (identity: string): { icon: string; title: string } => {
  const lowerIdentity = identity.toLowerCase();

  if (lowerIdentity.includes('poke') || lowerIdentity.includes('siege')) {
    return { icon: '🏹', title: 'Poke & Siege' };
  }
  if (lowerIdentity.includes('dive') || lowerIdentity.includes('all-in')) {
    return { icon: '💥', title: 'All-in & Dive' };
  }
  if (lowerIdentity.includes('pick') || lowerIdentity.includes('assassinate')) {
    return { icon: '🎯', title: 'Pick & Assassination' };
  }
  if (lowerIdentity.includes('protect') || lowerIdentity.includes('peel') || lowerIdentity.includes('hyper-carry')) {
    return { icon: '🛡️', title: 'Protect the Carry' };
  }
   if (lowerIdentity.includes('split push')) {
    return { icon: '➡️', title: 'Split Push' };
  }
  if (lowerIdentity.includes('team fight') || lowerIdentity.includes('wombo combo')) {
    return { icon: '🌀', title: 'Team Fight' };
  }
  if (lowerIdentity.includes('balanced') || lowerIdentity.includes('standard')) {
    return { icon: '⚖️', title: 'Balanced' };
  }

  return { icon: '❓', title: 'Unknown Identity' };
};

const TeamIdentityIcon: React.FC<TeamIdentityIconProps> = ({ identity }) => {
  if (!identity) return null;
  const { icon, title } = getIconForIdentity(identity);

  return (
    <span title={title} className="text-lg">
      {icon}
    </span>
  );
};

export default TeamIdentityIcon;
