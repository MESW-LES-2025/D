'use client';

import type { KanbanBoardDropDirection } from '@/components/ui/kanban';
import type { Status, StatusOption, TaskWithAssignees } from '@/lib/task/task-types';
import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { KanbanTaskCard } from '@/components/tasks/kanban/kanban-task-card';
import { updateTaskStatus } from '@/components/tasks/status-quick-action.action';
import { TaskSheet } from '@/components/tasks/task-sheet';
import {
  KanbanBoard,
  KanbanBoardColumn,
  KanbanBoardColumnHeader,
  KanbanBoardColumnList,
  KanbanBoardColumnListItem,
  KanbanBoardColumnTitle,
  KanbanBoardExtraMargin,
  KanbanBoardProvider,
  useDndEvents,
} from '@/components/ui/kanban';
import { allStatuses } from '@/lib/task/task-options';
import { cn } from '@/lib/utils';

type KanbanColumn = {
  id: string;
  title: string;
  status: Status;
  color: string;
  items: TaskWithAssignees[];
};

type TaskKanbanBoardProps = {
  tasks: TaskWithAssignees[];
  isAdmin?: boolean;
  statusOptions?: StatusOption[];
};

function groupTasksByStatus(tasks: TaskWithAssignees[], statusOptions: StatusOption[]): KanbanColumn[] {
  return statusOptions.map(status => ({
    id: status.value,
    title: status.label,
    status: status.value as Status,
    color: status.color,
    items: tasks.filter(task => task.status === status.value),
  }));
}

export function TaskKanbanBoard({ tasks, isAdmin = false, statusOptions = allStatuses }: TaskKanbanBoardProps) {
  const router = useRouter();
  const [columns, setColumns] = useState<KanbanColumn[]>(() =>
    groupTasksByStatus(tasks, statusOptions),
  );
  const [selectedTask, setSelectedTask] = useState<TaskWithAssignees | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const activeCardId = ''; // Keyboard navigation not yet implemented
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  // Update columns when tasks or statusOptions props change
  // Using refs to track if props have changed to avoid infinite loops
  const prevTasksRef = useRef(tasks);
  const prevStatusOptionsRef = useRef(statusOptions);
  if (prevTasksRef.current !== tasks || prevStatusOptionsRef.current !== statusOptions) {
    prevTasksRef.current = tasks;
    prevStatusOptionsRef.current = statusOptions;
    setColumns(groupTasksByStatus(tasks, statusOptions));
  }

  const handleCardClick = (task: TaskWithAssignees) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const handleMoveCardToColumn = async (
    targetColumnId: string,
    targetIndex: number,
    card: TaskWithAssignees,
  ) => {
    const sourceColumn = columns.find(col =>
      col.items.some(item => item.id === card.id),
    );
    const targetColumn = columns.find(col => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn) {
      return;
    }

    // Optimistic update
    setColumns(previousColumns =>
      previousColumns.map((column) => {
        if (column.id === targetColumnId) {
          const updatedItems = column.items.filter(item => item.id !== card.id);
          return {
            ...column,
            items: [
              ...updatedItems.slice(0, targetIndex),
              { ...card, status: targetColumn.status },
              ...updatedItems.slice(targetIndex),
            ],
          };
        } else {
          return {
            ...column,
            items: column.items.filter(item => item.id !== card.id),
          };
        }
      }),
    );

    // Only update if status actually changed
    if (sourceColumn.status !== targetColumn.status) {
      startTransition(async () => {
        const result = await updateTaskStatus(card.id, targetColumn.status);

        if (result.error) {
          toast.error(result.error);
          // Revert optimistic update
          setColumns(groupTasksByStatus(tasks, statusOptions));
          return;
        }

        if (targetColumn.status === 'done') {
          const completionMessages = [
            'Task complete! Well done!',
            'Complete! Good job!',
            'Done! Great work!',
          ];
          const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
          let pointsText = '';
          if (result.score && result.score > 0) {
            if (result.assigneeCount && result.assigneeCount > 1) {
              const pointsPerAssignee = Math.round(result.score / result.assigneeCount);
              pointsText = ` +${pointsPerAssignee} pts each (${result.score} total)`;
            } else {
              pointsText = ` +${result.score} points`;
            }
          }
          toast.success(`${randomMessage}${pointsText}`);
        } else {
          toast.success(`Moved to ${targetColumn.title}`);
        }

        // Show achievement toasts
        if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
          const previouslyUnlockedStr = localStorage.getItem('unlockedAchievements');
          const previouslyUnlocked = previouslyUnlockedStr ? JSON.parse(previouslyUnlockedStr) : [];

          result.newlyUnlocked.forEach((achievement) => {
            if (!previouslyUnlocked.includes(achievement.id)) {
              toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                duration: 5000,
              });
            }
          });

          const currentlyUnlockedIds = result.newlyUnlocked.map(a => a.id);
          localStorage.setItem('unlockedAchievements', JSON.stringify(currentlyUnlockedIds));
        }

        // Refresh to get updated data
        router.refresh();
      });
    }
  };

  return (
    <KanbanBoardProvider>
      <TaskKanbanBoardContent
        columns={columns}
        activeCardId={activeCardId}
        scrollContainerRef={scrollContainerRef}
        onCardClick={handleCardClick}
        onMoveCardToColumn={handleMoveCardToColumn}
      />
      <TaskSheet
        open={sheetOpen}
        onOpenChangeAction={setSheetOpen}
        task={selectedTask}
        isAdmin={isAdmin}
      />
    </KanbanBoardProvider>
  );
}

type TaskKanbanBoardContentProps = {
  columns: KanbanColumn[];
  activeCardId: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onCardClick: (task: TaskWithAssignees) => void;
  onMoveCardToColumn: (columnId: string, index: number, card: TaskWithAssignees) => void;
};

function TaskKanbanBoardContent({
  columns,
  activeCardId,
  scrollContainerRef,
  onCardClick,
  onMoveCardToColumn,
}: TaskKanbanBoardContentProps) {
  return (
    <KanbanBoard ref={scrollContainerRef} className="h-[calc(100vh-250px)]">
      {columns.map(column => (
        <TaskKanbanColumn
          key={column.id}
          column={column}
          activeCardId={activeCardId}
          onCardClick={onCardClick}
          onMoveCardToColumn={onMoveCardToColumn}
        />
      ))}
      <KanbanBoardExtraMargin />
    </KanbanBoard>
  );
}

type TaskKanbanColumnProps = {
  column: KanbanColumn;
  activeCardId: string;
  onCardClick: (task: TaskWithAssignees) => void;
  onMoveCardToColumn: (columnId: string, index: number, card: TaskWithAssignees) => void;
};

function TaskKanbanColumn({
  column,
  activeCardId,
  onCardClick,
  onMoveCardToColumn,
}: TaskKanbanColumnProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const { onDragCancel, onDragEnd } = useDndEvents();

  function handleDropOverColumn(dataTransferData: string) {
    const card = JSON.parse(dataTransferData) as TaskWithAssignees;
    onMoveCardToColumn(column.id, column.items.length, card);
  }

  function handleDropOverListItem(cardId: string) {
    return (
      dataTransferData: string,
      dropDirection: KanbanBoardDropDirection,
    ) => {
      const card = JSON.parse(dataTransferData) as TaskWithAssignees;
      const cardIndex = column.items.findIndex(item => item.id === cardId);
      const currentCardIndex = column.items.findIndex(item => item.id === card.id);

      const baseIndex = dropDirection === 'top' ? cardIndex : cardIndex + 1;
      const targetIndex
        = currentCardIndex !== -1 && currentCardIndex < baseIndex
          ? baseIndex - 1
          : baseIndex;

      const safeTargetIndex = Math.max(
        0,
        Math.min(targetIndex, column.items.length),
      );
      const overCard = column.items[safeTargetIndex];

      if (card.id === overCard?.id) {
        onDragCancel(card.id);
      } else {
        onMoveCardToColumn(column.id, safeTargetIndex, card);
        onDragEnd(card.id, overCard?.id || column.id);
      }
    };
  }

  return (
    <KanbanBoardColumn
      columnId={column.id}
      onDropOverColumn={handleDropOverColumn}
    >
      <KanbanBoardColumnHeader>
        <KanbanBoardColumnTitle columnId={column.id} className="flex w-full items-center justify-between gap-2 px-1">
          <div className={cn('flex flex-1 items-center gap-2', column.color)}>
            {(() => {
              const StatusIcon = allStatuses.find(status => status.value === column.status)?.icon;
              return StatusIcon ? <StatusIcon className="h-4 w-4" /> : null;
            })()}
            {column.title}
          </div>
          <span className="text-xs text-muted-foreground">
            {column.items.length}
          </span>
        </KanbanBoardColumnTitle>
      </KanbanBoardColumnHeader>

      <KanbanBoardColumnList ref={listRef}>
        {column.items.map(task => (
          <KanbanBoardColumnListItem
            cardId={task.id}
            key={task.id}
            onDropOverListItem={handleDropOverListItem(task.id)}
          >
            <KanbanTaskCard
              task={task}
              onClickAction={() => onCardClick(task)}
              isActive={activeCardId === task.id}
            />
          </KanbanBoardColumnListItem>
        ))}
      </KanbanBoardColumnList>
    </KanbanBoardColumn>
  );
}
