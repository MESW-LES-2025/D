import TeamGoals from '@/components/TeamGoals';

export const metadata = {
  title: 'Team Goals',
  description: 'Create and manage your team goals',
};

export default function TestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto py-12 px-4 md:px-8">
        <TeamGoals />
      </div>
    </main>
  );
}