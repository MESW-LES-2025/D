"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Difficulty = "Light" | "Medium" | "Heavy";

type Task = {
  id: string;
  title: string;
  difficulty: Difficulty;
  points: number;
  completed?: boolean;
};

const INITIAL_TASKS: Task[] = [
  { id: "t1", title: "Organize meeting notes", difficulty: "Light", points: 10 },
  { id: "t2", title: "Prepare sprint overview", difficulty: "Medium", points: 20 },
  { id: "t3", title: "Fix critical bug in auth", difficulty: "Heavy", points: 30 },
  { id: "t4", title: "Write integration test", difficulty: "Medium", points: 20 },
  { id: "t5", title: "Clean up CSS and styles", difficulty: "Light", points: 10 },
  { id: "t6", title: "Design feature prototype", difficulty: "Heavy", points: 30 },
];

const MESSAGES = [
  "Great job! +{points} points 🎉",
  "Awesome work! +{points} pts 👏",
  "Nice! You earned +{points} points 🏅",
  "Well done! +{points} 🎊",
  "Sweet! +{points} points 🚀",
];

function randomMessage(points: number) {
  const idx = Math.floor(Math.random() * MESSAGES.length);
  const template = MESSAGES[idx] ?? MESSAGES[0] ?? "Great job! +{points} 🎉";
  return template.replace("{points}", String(points));
}

export default function TaskSimulator() {
  const [tasks, setTasks] = useState<Task[]>(() => INITIAL_TASKS);
  const [banner, setBanner] = useState<{ text: string; visible: boolean } | null>(null);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 3500);
    return () => clearTimeout(t);
  }, [banner]);

  function handleToggle(task: Task, checked: boolean) {
    // when user checks box and it's not completed, ask for confirmation
    if (checked && !task.completed) {
      const ok = window.confirm(`Mark "${task.title}" as completed and award ${task.points} points?`);
      if (!ok) {
        // nothing, leave checkbox unchecked
        setTasks((s) => s.map((t) => (t.id === task.id ? { ...t, completed: false } : t)));
        return;
      }

      // confirmed: mark completed, show banner and toast
      setTasks((s) => s.map((t) => (t.id === task.id ? { ...t, completed: true } : t)));
      const msg = randomMessage(task.points);
      setBanner({ text: msg, visible: true });
      // also show a toast with small emoji
      toast.success(msg);
      return;
    }

    // unchecking or other cases: just update state
    setTasks((s) => s.map((t) => (t.id === task.id ? { ...t, completed: checked } : t)));
  }

  function resetAll() {
    setTasks(INITIAL_TASKS.map((t) => ({ ...t, completed: false })));
  }

  return (
    <section aria-labelledby="task-sim-heading" className="space-y-4">
      {/* animated top banner */}
      <div
        aria-hidden={!banner}
        className={`fixed left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 px-4 transition-transform duration-400 sm:px-6 ${
          banner ? "top-6 translate-y-0" : "-top-24 -translate-y-full"
        }`}
      >
        {banner && (
          <div className="mx-auto flex items-center justify-between gap-4 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-bounce">🎉</span>
              <div>
                <strong className="block text-lg">{banner.text}</strong>
                <small className="opacity-90">Keep it up — more goals, more points!</small>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setBanner(null)}>
              Dismiss
            </Button>
          </div>
        )}
      </div>

      <div>
        <h3 id="task-sim-heading" className="text-lg font-semibold">Simulated Tasks</h3>
        <p className="text-sm text-muted-foreground">Check tasks as completed to earn points (Light=10, Medium=20, Heavy=30).</p>
      </div>

      <div className="grid gap-2">
        {tasks.map((task) => (
          <label
            key={task.id}
            className={`flex items-center justify-between gap-3 rounded-md border p-3 ${task.completed ? "bg-muted/20 opacity-90" : "bg-card"}`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={!!task.completed}
                onCheckedChange={(v) => handleToggle(task, Boolean(v))}
              />
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="font-medium">{task.title}</span>
                  <span className="text-xs rounded-full bg-gray-100 px-2 py-0.5 text-muted-foreground">
                    {task.difficulty}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{task.points} points</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {task.completed ? <span className="text-sm text-emerald-600">Completed</span> : null}
              <Button size="sm" variant="outline" onClick={() => {
                // quick mark/unmark without confirmation via small button
                if (!task.completed) {
                  const ok = window.confirm(`Mark "${task.title}" as completed and award ${task.points} points?`);
                  if (!ok) return;
                  setTasks((s) => s.map((t) => (t.id === task.id ? { ...t, completed: true } : t)));
                  const msg = randomMessage(task.points);
                  setBanner({ text: msg, visible: true });
                  toast.success(msg);
                } else {
                  setTasks((s) => s.map((t) => (t.id === task.id ? { ...t, completed: false } : t)));
                }
              }}>
                {task.completed ? 'Undo' : 'Quick Done'}
              </Button>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={resetAll}>Reset</Button>
        <div className="text-sm text-muted-foreground">(This is a simulated demo.)</div>
      </div>
    </section>
  );
}
