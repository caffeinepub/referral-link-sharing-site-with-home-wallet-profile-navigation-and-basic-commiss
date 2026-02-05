import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet as WalletIcon, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useWallet } from './useWallet';
import RequestPayoutDialog from './RequestPayoutDialog';
import { formatAmount, formatTimestamp } from '../utils/format';

export default function WalletSection() {
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const { balance, isLoadingBalance, transactions } = useWallet();

  const totalEarned = transactions
    .filter((t) => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="pt-4">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">Track your earnings and request payouts</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{formatAmount(balance)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalEarned)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Request payout button */}
      <Button onClick={() => setShowPayoutDialog(true)} className="w-full" size="lg">
        <ArrowUpRight className="w-4 h-4 mr-2" />
        Request Payout
      </Button>

      {/* Transaction history */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your earnings and payout requests</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium capitalize">{transaction.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(transaction.timestamp)}
                    </p>
                    {transaction.status && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-muted">
                        {transaction.status}
                      </span>
                    )}
                  </div>
                  <div
                    className={`font-semibold ${
                      transaction.type === 'earned' ? 'text-green-600 dark:text-green-400' : ''
                    }`}
                  >
                    {transaction.type === 'earned' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RequestPayoutDialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog} />
    </div>
  );
}
