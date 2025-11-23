import TeamGoals from '@/components/TeamGoals';

export const metadata = {
  title: 'Goals',
  description: 'Create and manage your team goals',
};

export default function GoalsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 md:px-8">
        <TeamGoals />
      </div>
    </main>
  );
}
