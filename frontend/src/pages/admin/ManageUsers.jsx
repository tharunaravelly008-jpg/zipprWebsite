import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersList } from '../../features/admin/adminSlice';
import { Card } from '../../components/common';
import { Loader2, UserX, UserCheck } from 'lucide-react';

export const ManageUsers = () => {
  const dispatch = useDispatch();
  const { usersList, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchUsersList({ limit: 50, offset: 0 }));
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold">Manage Riders</h1>
        <p className="text-brand-gray-500 mt-1">View and manage rider accounts.</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-gray-50 dark:bg-brand-gray-900/50 border-b border-brand-indigo/5 dark:border-brand-gray-800">
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">User</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Role</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-brand-gray-50 dark:hover:bg-brand-gray-900/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-indigo/10 dark:bg-brand-lime/10 flex items-center justify-center font-bold text-brand-indigo dark:text-brand-lime text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <div>{user.email}</div>
                      <div className="text-brand-gray-500 text-xs mt-0.5">{user.phone}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-brand-gray-100 dark:bg-brand-gray-800 rounded text-xs font-semibold uppercase">
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {user.is_active ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                          <UserCheck className="w-4 h-4" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold">
                          <UserX className="w-4 h-4" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right text-brand-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageUsers;
