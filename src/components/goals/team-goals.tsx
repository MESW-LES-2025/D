import type { TeamGoalData } from '@/lib/goals/types/goal';
import TeamGoalCard from '@/components/goals/team-goal-card';

type TeamGoalsProps = {
  data: TeamGoalData[];
};

export default function TeamGoals({ data }: TeamGoalsProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-8">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No active team goals</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a goal to track team progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-4 overflow-y-auto">
      {data.map(goal => (
        <TeamGoalCard
          key={goal.id}
          title={goal.title}
          description={goal.description}
          dueDate={goal.dueDate}
          currentValue={goal.currentValue}
          targetValue={goal.targetValue}
        />
      ))}
    </div>
  );
}
