import UserList from '@/components/UserList';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function Home() {
  await dbConnect();
  const users = await User.find().sort({ createdAt: -1 }).lean();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Video Assignment Tracker
        </h1>

        <UserList users={JSON.parse(JSON.stringify(users))} />
      </div>
    </div>
  );
}