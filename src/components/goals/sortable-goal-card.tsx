'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GoalCard } from '@/components/goals/goal-card';

type Task = {
  id: string;
  name: string;
  completed?: boolean;
};

type Goal = {
  id: string;
  name: string;
  description?: string;
  dueDate?: string;
  points?: number;
  assigneeName?: string;
  assigneeEmail?: string;
  assigneeId?: string;
  tasks?: Task[];
  onDelete?: (id: string) => void;
  onEdit?: (goal: Goal) => void;
};

export function SortableGoalCard({
  goal,
  onDelete,
  onEdit,
  isDraggingEnabled,
}: {
  goal: Goal;
  onDelete?: (id: string) => void;
  onEdit?: (goal: Goal) => void;
  isDraggingEnabled?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id, disabled: !isDraggingEnabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <GoalCard
        goal={goal}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </div>
  );
}
