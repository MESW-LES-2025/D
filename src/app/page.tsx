import type { Metadata } from 'next';
import { CounterForm } from '@/components/CounterForm';
import { CurrentCount } from '@/components/CurrentCount';

export const metadata: Metadata = {
  title: 'TaskUp',
  description: 'A simple task management app to boost your productivity.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
            Setup App
          </h1>

          <div className="space-y-6">
            <div className="text-center">
            </div>

            <CurrentCount />
            <CounterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
