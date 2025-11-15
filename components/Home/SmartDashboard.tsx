import React from 'react';
import type { Page, UserProfile, HistoryEntry, DashboardCardSetting } from '../../types';
import { Button } from '../common/Button';
import { Sun, Library, FlaskConical, Clock, TrendingUp, Target } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from '../../hooks/useTranslation';

interface SmartDashboardProps {
  profile: UserProfile;
  latestPlaybookEntry?: HistoryEntry;
  setCurrentPage: (page: Page) => void;
}

const SmartCard = ({
  title,
  description,
  actionText,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <div className="bg-bg-secondary p-4 rounded-lg border border-border-primary flex items-center gap-4 w-full sm:w-auto flex-1 basis-full sm:basis-1/3 shadow-sm">
    <div className="flex-shrink-0 bg-accent-light text-accent w-12 h-12 rounded-md flex items-center justify-center">
      {icon}
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
    <Button onClick={onClick} variant="secondary" className="flex-shrink-0">
      {actionText}
    </Button>
  </div>
);

export const SmartDashboard = ({ profile, latestPlaybookEntry, setCurrentPage }: SmartDashboardProps) => {
  const { settings } = useSettings();
  const { t } = useTranslation();
  const isTrialCompleted = profile.missions.daily.find(m => m.id === 'd2')?.completed ?? false;
  
  // Get recent activity (last 3 completed missions)
  const recentMissions = [...profile.missions.daily, ...profile.missions.weekly]
    .filter(m => m.completed)
    .sort((a, b) => {
      // Sort by completion time (most recent first)
      // Since we don't have timestamps, we'll use the order they appear
      return 0;
    })
    .slice(0, 3);
  
  // Calculate progress percentage
  const totalMissions = [...profile.missions.daily, ...profile.missions.weekly, ...profile.missions.gettingStarted];
  const completedMissions = totalMissions.filter(m => m.completed).length;
  const progressPercentage = totalMissions.length > 0 ? (completedMissions / totalMissions.length) * 100 : 0;

  const potentialCards: { id: DashboardCardSetting['id']; condition: boolean; component: React.ReactNode }[] = [
    {
      id: 'trial',
      condition: !isTrialCompleted,
      component: (
        <SmartCard
          title="Daily Challenge"
          description="Your daily strategic challenge is ready."
          actionText="Begin Trial"
          onClick={() => setCurrentPage('Daily Challenge')}
          icon={<Sun size={28} strokeWidth={1.5} />}
        />
      ),
    },
    {
      id: 'playbook',
      condition: !!latestPlaybookEntry,
      component: (
        <SmartCard
          title="Latest Playbook Entry"
          description={`Review your "${latestPlaybookEntry?.name}" strategy.`}
          actionText="View"
          onClick={() => setCurrentPage('Archives')}
          icon={<Library size={28} strokeWidth={1.5} />}
        />
      ),
    },
  ];

  const enabledCardIds = new Set(settings.dashboardCards?.filter(c => c.enabled).map(c => c.id) || []);

  const cards = potentialCards
    .filter(card => enabledCardIds.has(card.id))
    .filter(card => card.condition)
    .map(c => <React.Fragment key={c.id}>{c.component}</React.Fragment>);

  // Fallback card if no other smart actions are available
  if (cards.length === 0 && enabledCardIds.has('draft-lab')) {
    cards.push(
      <React.Fragment key="draft-lab">
        <SmartCard
          title="Start a New Draft"
          description="Theory-craft your next masterpiece in the Lab."
          actionText="Enter Lab"
          onClick={() => setCurrentPage('Strategy Forge')}
          icon={<FlaskConical size={28} strokeWidth={1.5} />}
        />
      </React.Fragment>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-[hsl(var(--text-primary))] tracking-wide">
          {t('home_dashboard_title')}
        </h2>
        {profile.level > 0 && (
          <div className="text-sm text-[hsl(var(--text-secondary))]">
            Level {profile.level} • {profile.sp} SP
          </div>
        )}
      </div>

      {/* Progress Section */}
      {totalMissions.length > 0 && (
        <div className="bg-[hsl(var(--bg-secondary))] p-4 rounded-lg border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[hsl(var(--text-primary))]">Overall Progress</span>
            <span className="text-sm text-[hsl(var(--text-secondary))]">
              {completedMissions} / {totalMissions.length} missions
            </span>
          </div>
          <div className="w-full bg-[hsl(var(--surface-tertiary))] rounded-full h-2">
            <div
              className="bg-[hsl(var(--accent))] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentMissions.length > 0 && (
        <div className="bg-[hsl(var(--bg-secondary))] p-4 rounded-lg border border-[hsl(var(--border))]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-[hsl(var(--accent))]" />
            <h3 className="font-semibold text-[hsl(var(--text-primary))]">Recent Activity</h3>
          </div>
          <div className="space-y-2">
            {recentMissions.map((mission, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
                <Target className="h-4 w-4 text-[hsl(var(--accent))]" />
                <span>{mission.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      <div className="bg-[hsl(var(--bg-secondary))] p-4 rounded-lg border border-[hsl(var(--border))]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-5 w-5 text-[hsl(var(--accent))]" />
          <h3 className="font-semibold text-[hsl(var(--text-primary))]">Recommendations</h3>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">{cards}</div>
      </div>
    </div>
  );
};
