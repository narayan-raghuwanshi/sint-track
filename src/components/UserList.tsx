'use client';

import { useState, useEffect } from 'react';
import { IUser } from '@/models/User';

// Date utilities
export const getISTDateTime = (date: Date | null): string => {
    if (!date) return 'Not assigned yet';
    return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

export const isValidManualDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

export const isOver30Hours = (date: Date | null): boolean => {
    if (!date) return false;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff > 30 * 60 * 60 * 1000;
};

const FilterButton = ({
    filter,
    currentFilter,
    setFilter,
    children
}: {
    filter: "all" | "not assigned" | "overdue" | "onTime";
    currentFilter: string;
    setFilter: (filter: "all" | "not assigned" | "overdue" | "onTime") => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={() => setFilter(filter)}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${currentFilter === filter
            ? 'bg-blue-600 text-white shadow-inner'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
    >
        {children}
    </button>
);

export default function UserList({ users: initialUsers }: { users: IUser[] }) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [users, setUsers] = useState<IUser[]>(() =>
        initialUsers.map(user => ({
            ...user,
            lastVideoAssignedAt: user.lastVideoAssignedAt ? new Date(user.lastVideoAssignedAt) : null,
            createdAt: new Date(user.createdAt)
        }))
    );
    const [newUserName, setNewUserName] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [manualTime, setManualTime] = useState('');
    const [currentFilter, setCurrentFilter] = useState<'all' | 'not assigned' | 'overdue' | 'onTime'>('all');

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const createUser = async () => {
        if (!newUserName.trim()) return;
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newUserName.trim() }),
            });
            const newUser = await response.json();
            setUsers([{ ...newUser, lastVideoAssignedAt: null }, ...users]);
            setNewUserName('');
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };
    const updateVideoTime = async (userId: string, customTime?: string) => {
        try {
            const body = customTime ? {
                manualTime: new Date(customTime).toISOString() // Convert local time to UTC ISO string
            } : {};

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const updatedUser = await response.json();

            // Convert UTC time from server to local Date object
            const istDate = updatedUser.lastVideoAssignedAt
                ? new Date(updatedUser.lastVideoAssignedAt)
                : null;

            setUsers(users.map(user =>
                user._id === updatedUser._id ? {
                    ...updatedUser,
                    lastVideoAssignedAt: istDate
                } : user
            ));

            setEditingUserId(null);
            setManualTime('');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const resetVideoTime = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reset: true }),
            });
            const updatedUser = await response.json();
            setUsers(users.map(user =>
                user._id === updatedUser._id ? {
                    ...updatedUser,
                    lastVideoAssignedAt: null
                } : user
            ));
        } catch (error) {
            console.error('Error resetting video time:', error);
        }
    };

    const handleManualTime = (userId: string) => {
        if (isValidManualDate(manualTime)) {
            updateVideoTime(userId, manualTime);
        }
    };

    const filteredUsers = users.filter(user => {
        const lastVideoTime = user.lastVideoAssignedAt;
        if (currentFilter === 'not assigned') return !lastVideoTime;
        if (currentFilter === 'overdue') return lastVideoTime && isOver30Hours(lastVideoTime);
        if (currentFilter === 'onTime') return lastVideoTime && !isOver30Hours(lastVideoTime);
        return true; // 'all' filter
    });

    const getStatus = (lastVideoTime: Date | null) => {
        if (!lastVideoTime) return 'not assigned';
        return isOver30Hours(lastVideoTime) ? 'overdue' : 'onTime';
    };

    const getCount = (filter: string) => {
        switch (filter) {
            case 'not assigned': return users.filter(u => !u.lastVideoAssignedAt).length;
            case 'overdue': return users.filter(u => u.lastVideoAssignedAt && isOver30Hours(u.lastVideoAssignedAt)).length;
            case 'onTime': return users.filter(u => u.lastVideoAssignedAt && !isOver30Hours(u.lastVideoAssignedAt)).length;
            default: return users.length;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 space-y-8">
                {/* Create User Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Create New User</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Enter user name"
                            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && createUser()}
                        />
                        <button
                            onClick={createUser}
                            className="px-5 py-2.5 bg-blue-600 text-sm font-medium text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                            disabled={!newUserName.trim()}
                        >
                            Create
                        </button>
                    </div>
                </div>

                {/* Users List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-lg font-medium text-gray-900">Users List</h2>
                        <div className="flex gap-2 flex-wrap">
                            <FilterButton filter="all" currentFilter={currentFilter} setFilter={setCurrentFilter}>
                                All ({getCount('all')})
                            </FilterButton>
                            <FilterButton filter="not assigned" currentFilter={currentFilter} setFilter={setCurrentFilter}>
                                Not assigned ({getCount('not assigned')})
                            </FilterButton>
                            <FilterButton filter="onTime" currentFilter={currentFilter} setFilter={setCurrentFilter}>
                                On Time ({getCount('onTime')})
                            </FilterButton>
                            <FilterButton filter="overdue" currentFilter={currentFilter} setFilter={setCurrentFilter}>
                                Overdue ({getCount('overdue')})
                            </FilterButton>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => {
                            const lastVideoTime = user.lastVideoAssignedAt;
                            const status = getStatus(lastVideoTime);
                            let timerText = 'Not assigned yet';

                            if (lastVideoTime) {
                                const elapsedMs = currentTime.getTime() - lastVideoTime.getTime();
                                const remainingMs = 30 * 60 * 60 * 1000 - elapsedMs;
                                const isNegative = remainingMs < 0;
                                const absMs = Math.abs(remainingMs);
                                const hours = Math.floor(absMs / (1000 * 60 * 60));
                                const minutes = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
                                timerText = `${isNegative ? '-' : ''}${hours}h ${Math.round(minutes)}m`;
                            }

                            return (
                                <div
                                    key={user._id}
                                    className={`p-6 hover:bg-gray-50 transition-colors ${status === 'not assigned' ? 'bg-green-50/50' :
                                        status === 'overdue' ? 'bg-red-50/50' : 'bg-blue-50/50'
                                        }`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
                                        <div className="space-y-1.5">
                                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                                            <div className={`text-sm ${status === 'overdue' ? 'text-red-700' :
                                                status === 'not assigned' ? 'text-green-700' : 'text-blue-700'
                                                }`}>
                                                <p>Last assigned: {getISTDateTime(lastVideoTime)}</p>
                                                {lastVideoTime && (
                                                    <p className="font-mono mt-1">
                                                        Timer: <span className="font-medium">{timerText}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-auto">
                                            {editingUserId === user._id ? (
                                                <div className="flex flex-col sm:flex-row gap-3">
                                                    <input
                                                        type="datetime-local"
                                                        value={manualTime}
                                                        onChange={(e) => setManualTime(e.target.value)}
                                                        className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleManualTime(user._id)}
                                                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                            disabled={!isValidManualDate(manualTime)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setEditingUserId(null);
                                                                setManualTime('');
                                                            }}
                                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => updateVideoTime(user._id)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Now
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingUserId(user._id)}
                                                        className="px-4 py-2 text-sm font-medium text-gray-900 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
                                                    >
                                                        Manual
                                                    </button>
                                                    <button
                                                        onClick={() => resetVideoTime(user._id)}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}