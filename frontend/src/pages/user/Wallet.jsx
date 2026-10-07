import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchWallet, fetchTransactions, addMoneyToWallet, clearWalletError
} from '../../features/wallet/walletSlice';
import { Card, Button } from '../../components/common';
import {
  Wallet as WalletIcon, Plus, ArrowDownCircle, ArrowUpCircle,
  CreditCard, Loader2, CheckCircle, X
} from 'lucide-react';
import { cn } from '../../utils/cn';

const ADD_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];
const PAYMENT_METHODS = [
  { id: 'upi',  label: 'UPI',         icon: '📱' },
  { id: 'card', label: 'Debit / Credit Card', icon: '💳' },
  { id: 'cash', label: 'Net Banking',  icon: '🏦' },
];

export const WalletPage = () => {
  const dispatch = useDispatch();
  const { balance, currency, transactions, loading, addMoneyLoading, error } = useSelector(s => s.wallet);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(fetchWallet());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const handleAddMoney = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    try {
      await dispatch(addMoneyToWallet({ amount, method: selectedMethod })).unwrap();
      dispatch(fetchTransactions());
      setSuccessMsg(`₹${amount} added successfully!`);
      setShowAddModal(false);
      setSelectedAmount(null);
      setCustomAmount('');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {}
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">

      {/* Balance Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-indigo text-brand-lime p-8 shadow-2xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-8 w-56 h-56 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 rounded-2xl">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold opacity-70 uppercase tracking-widest">Zippr Wallet</p>
              <p className="text-xs opacity-50">Available Balance</p>
            </div>
          </div>

          <p className="font-heading text-6xl font-bold tracking-tight mb-1">
            ₹{balance.toFixed(2)}
          </p>
          <p className="text-sm opacity-60 font-medium">{currency} · Instant Pay</p>

          <button
            onClick={() => setShowAddModal(true)}
            className="mt-8 flex items-center gap-2 px-6 py-3 bg-brand-lime text-brand-indigo font-bold rounded-2xl hover:bg-white transition-colors text-sm shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Money
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl text-green-700 dark:text-green-400 font-semibold">
          <CheckCircle className="w-5 h-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl text-red-600 dark:text-red-400 font-semibold">
          <X className="w-4 h-4 shrink-0 cursor-pointer" onClick={() => dispatch(clearWalletError())} />
          {error}
        </div>
      )}

      {/* Transaction History */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-brand-indigo/5 dark:border-brand-gray-800">
          <h3 className="font-heading text-lg font-bold">Transaction History</h3>
          <p className="text-sm text-brand-gray-500 mt-0.5">Your wallet credits and debits.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-indigo dark:text-brand-lime" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-brand-gray-400 font-semibold">
            No transactions yet. Add money to get started!
          </div>
        ) : (
          <div className="divide-y divide-brand-indigo/5 dark:divide-brand-gray-800">
            {transactions.map((tx, idx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div key={idx} className="flex items-center justify-between p-5 hover:bg-brand-gray-50 dark:hover:bg-brand-gray-900/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'p-2.5 rounded-xl',
                      isCredit
                        ? 'bg-green-100 dark:bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-500/15 text-red-500 dark:text-red-400'
                    )}>
                      {isCredit
                        ? <ArrowDownCircle className="w-5 h-5" />
                        : <ArrowUpCircle className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{tx.reason}</p>
                      <p className="text-xs text-brand-gray-400 mt-0.5">{formatDate(tx.created_at)}</p>
                    </div>
                  </div>
                  <p className={cn(
                    'font-bold text-lg',
                    isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  )}>
                    {isCredit ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Money Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-brand-dark/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-brand-dark rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-indigo/5 dark:border-brand-gray-800">
              <h3 className="font-heading text-xl font-bold">Add Money to Wallet</h3>
              <button
                onClick={() => { setShowAddModal(false); setSelectedAmount(null); setCustomAmount(''); }}
                className="p-2 rounded-xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              {/* Quick Amounts */}
              <div>
                <p className="text-sm font-semibold text-brand-gray-500 mb-3 uppercase tracking-wider">Quick Select</p>
                <div className="grid grid-cols-3 gap-3">
                  {ADD_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                      className={cn(
                        'py-3 rounded-2xl font-bold text-sm transition-all border-2',
                        selectedAmount === amt
                          ? 'border-brand-indigo bg-brand-indigo text-brand-lime dark:border-brand-lime dark:bg-brand-lime dark:text-brand-indigo'
                          : 'border-brand-gray-100 dark:border-brand-gray-700 hover:border-brand-indigo/50 dark:hover:border-brand-lime/50'
                      )}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <p className="text-sm font-semibold text-brand-gray-500 mb-2 uppercase tracking-wider">Or Enter Amount</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-brand-gray-400 text-lg">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={customAmount}
                    onChange={e => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                    className="w-full pl-8 pr-4 py-3 bg-brand-gray-50 dark:bg-brand-gray-900 border-2 border-brand-gray-100 dark:border-brand-gray-700 rounded-2xl font-bold text-lg focus:border-brand-indigo dark:focus:border-brand-lime outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm font-semibold text-brand-gray-500 mb-3 uppercase tracking-wider">Payment Method</p>
                <div className="flex flex-col gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={cn(
                        'flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all',
                        selectedMethod === m.id
                          ? 'border-brand-indigo bg-brand-indigo/5 dark:border-brand-lime dark:bg-brand-lime/10'
                          : 'border-brand-gray-100 dark:border-brand-gray-700 hover:border-brand-indigo/40 dark:hover:border-brand-lime/40'
                      )}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span className="font-semibold text-sm">{m.label}</span>
                      {selectedMethod === m.id && (
                        <CheckCircle className="w-4 h-4 ml-auto text-brand-indigo dark:text-brand-lime" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                onClick={handleAddMoney}
                isLoading={addMoneyLoading}
                disabled={addMoneyLoading || (!selectedAmount && !customAmount)}
              >
                Add ₹{selectedAmount || customAmount || '0'} to Wallet
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
