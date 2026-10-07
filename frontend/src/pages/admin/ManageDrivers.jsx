import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDriversList } from '../../features/admin/adminSlice';
import { Card } from '../../components/common';
import { Loader2, ShieldCheck, ShieldAlert } from 'lucide-react';

export const ManageDrivers = () => {
  const dispatch = useDispatch();
  const { driversList, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDriversList({ limit: 50, offset: 0 }));
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-heading text-3xl font-bold">Manage Partners</h1>
        <p className="text-brand-gray-500 mt-1">Review driver verifications and vehicle details.</p>
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
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Driver ID</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Vehicle</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">License / Reg</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider">Verification</th>
                  <th className="p-4 font-semibold text-xs text-brand-gray-500 uppercase tracking-wider text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
                {driversList.map((driver, idx) => (
                  <tr key={idx} className="hover:bg-brand-gray-50 dark:hover:bg-brand-gray-900/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-brand-indigo dark:text-brand-lime">
                      #{driver.user_id.substring(0, 8)}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 bg-brand-indigo/10 dark:bg-brand-lime/10 text-brand-indigo dark:text-brand-lime rounded text-xs font-bold uppercase">
                        {driver.vehicle_type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="font-mono text-xs">{driver.vehicle_number}</div>
                      <div className="text-brand-gray-500 text-xs mt-0.5">DL: {driver.license_number}</div>
                    </td>
                    <td className="p-4 text-sm">
                      {driver.is_verified ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                          <ShieldCheck className="w-4 h-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                          <ShieldAlert className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-right font-bold">
                      {driver.rating} ★
                    </td>
                  </tr>
                ))}
                {driversList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-brand-gray-500">No partner profiles found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ManageDrivers;
