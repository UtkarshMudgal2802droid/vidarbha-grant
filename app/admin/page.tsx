import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const applications = db.prepare('SELECT * FROM Application ORDER BY createdAt DESC').all() as any[];
  const stats = db.prepare("SELECT duplicatesSaved FROM Stats WHERE id = 'singleton'").get() as any;

  async function updateStatus(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    const newStatus = formData.get('status') as string;
    
    db.prepare('UPDATE Application SET status = ? WHERE id = ?').run(newStatus, id);
    revalidatePath('/admin');
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24 bg-white text-black font-sans">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Kavita's Review Dashboard</h1>
      </div>
      
      <div className="w-full max-w-5xl mb-8 flex gap-4">
        <div className="p-4 border rounded-xl bg-gray-50 flex-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Verified Entries</h2>
          <p className="text-3xl font-bold">{applications.length}</p>
        </div>
        <div className="p-4 border rounded-xl bg-gray-50 flex-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Duplicates Turned Away</h2>
          <p className="text-3xl font-bold">{stats?.duplicatesSaved || 0}</p>
        </div>
        <div className="p-4 border rounded-xl bg-gray-50 flex-1">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">Pending Review</h2>
          <p className="text-3xl font-bold">{applications.filter(a => a.status === 'pending').length}</p>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="p-3">Ticket ID</th>
                <th className="p-3">Applied At</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-gray-100">
                  <td className="p-3 font-mono text-sm">{app.id}</td>
                  <td className="p-3 text-sm">{new Date(app.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      app.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {app.status === 'pending' && (
                      <form action={updateStatus} className="flex gap-2">
                        <input type="hidden" name="id" value={app.id} />
                        <button type="submit" name="status" value="approved" className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Approve</button>
                        <button type="submit" name="status" value="rejected" className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">Reject</button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-gray-500">No applications yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
