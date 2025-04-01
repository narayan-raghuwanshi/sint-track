'use client';

import { useState, useEffect } from 'react';
import { IUser } from '@/models/User';
import { getISTDateTime, isOver30Hours, isValidManualDate } from '@/lib/dateUtils';

export default function UserList({ users: initialUsers }: { users: IUser[] }) {
    // Convert string dates to Date objects from server props
    const parsedUsers = initialUsers.map(user => ({
        ...user,
        lastVideoAssignedAt: user.lastVideoAssignedAt ? new Date(user.lastVideoAssignedAt) : null,
        createdAt: new Date(user.createdAt)
    }));

    const [users, setUsers] = useState<IUser[]>(parsedUsers);
    const [newUserName, setNewUserName] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [manualTime, setManualTime] = useState('');

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
            const body = customTime ? { manualTime: customTime } : {};

            const response = await fetch(`/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const updatedUser = await response.json();
            setUsers(users.map(user =>
                user._id === updatedUser._id ? {
                    ...updatedUser,
                    lastVideoAssignedAt: new Date(updatedUser.lastVideoAssignedAt)
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

    return (
        <>
            {/* Create User Section */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Create New User</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter user name"
                        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && createUser()}
                    />
                    <button
                        onClick={createUser}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                        disabled={!newUserName.trim()}
                    >
                        Create User
                    </button>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg p-6 shadow-md">
                <h2 className="text-xl font-semibold mb-4">Users List</h2>
                <div className="space-y-4">
                    {users.map((user) => {
                        const isOverdue = isOver30Hours(user.lastVideoAssignedAt);
                        return (
                            <div
                                key={user._id}
                                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded ${isOverdue ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="mb-2 sm:mb-0 flex-1">
                                    <h3 className="font-medium text-gray-800">{user.name}</h3>
                                    <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                        Last video assigned: {getISTDateTime(user.lastVideoAssignedAt)}
                                    </p>
                                </div>

                                <div className="flex gap-2 w-full sm:w-auto">
                                    {editingUserId === user._id ? (
                                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                                            <input
                                                type="datetime-local"
                                                value={manualTime}
                                                onChange={(e) => setManualTime(e.target.value)}
                                                className="p-2 border rounded text-sm w-full sm:w-48"
                                            />
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button
                                                    onClick={() => handleManualTime(user._id)}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors w-1/2 sm:w-auto disabled:bg-blue-300"
                                                    disabled={!isValidManualDate(manualTime)}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingUserId(null);
                                                        setManualTime('');
                                                    }}
                                                    className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors w-1/2 sm:w-auto"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button
                                                onClick={() => updateVideoTime(user._id)}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-1/2 sm:w-auto"
                                            >
                                                Now
                                            </button>
                                            <button
                                                onClick={() => setEditingUserId(user._id)}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors w-1/2 sm:w-auto"
                                            >
                                                Manual
                                            </button>
                                            <button
                                                onClick={() => resetVideoTime(user._id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors w-1/2 sm:w-auto"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}