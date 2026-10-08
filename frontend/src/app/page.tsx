import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="hero">
          <div className="hero-content text-center">
            <div className="max-w-xl">
              <h1 className="text-5xl font-bold">Smart Disaster Response</h1>
              <p className="py-6 text-lg">
                Coordinate emergencies, organize volunteers, and manage resource pledges efficiently in times of crisis.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register" className="btn btn-primary">Get Started</Link>
                <Link href="/login" className="btn btn-outline">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
