import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet as WalletIcon, TrendingUp, ArrowUpRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWallet, useMyPayoutRequests, useAllPayoutRequests, useApprovePayoutRequest, useRejectPayoutRequest } from './useWallet';
import RequestPayoutDialog from './RequestPayoutDialog';
import { formatAmount, formatTimestamp } from '../utils/format';
import { useIsAdmin } from '../auth/useIsAdmin';
import { useAuth } from '../auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ApprovalStatus } from '../../backend';
import { Principal } from '@icp-sdk/core/principal';
import SignInRequiredNotice from '../auth/SignInRequiredNotice';

export default function WalletSection() {
  const { isAuthenticated } = useAuth();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const { balance, isLoadingBalance, transactions } = useWallet();
  const { data: myPayoutRequests, isLoading: isLoadingMyRequests } = useMyPayoutRequests();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: allPayoutRequests, isLoading: isLoadingAllRequests } = useAllPayoutRequests();
  const approvePayoutMutation = useApprovePayoutRequest();
  const rejectPayoutMutation = useRejectPayoutRequest();

  // Show sign-in notice if not authenticated
  if (!isAuthenticated) {
    return <SignInRequiredNotice />;
  }

  const totalEarned = transactions
    .filter((t) => t.type === 'earned')
    .reduce((sum, t) => sum + t.amount, 0);

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.pending:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case ApprovalStatus.approved:
        return (
          <Badge className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case ApprovalStatus.rejected:
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
    }
  };

  const handleApprove = async (userPrincipal: Principal, requestId: bigint) => {
    try {
      await approvePayoutMutation.mutateAsync({
        user: userPrincipal,
        requestId,
      });
      toast.success('Payout request approved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve payout request');
    }
  };

  const handleReject = async (userPrincipal: Principal, requestId: bigint) => {
    try {
      await rejectPayoutMutation.mutateAsync({
        user: userPrincipal,
        requestId,
      });
      toast.success('Payout request rejected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject payout request');
    }
  };

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

      {/* Payout Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
          <CardDescription>Your payout request history</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMyRequests ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : myPayoutRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payout requests yet</p>
          ) : (
            <div className="space-y-3">
              {myPayoutRequests.map((request) => (
                <div
                  key={request.id.toString()}
                  className="flex items-center justify-between p-3 rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-medium">Payout Request #{request.id.toString()}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimestamp(Number(request.created) / 1000000)}
                    </p>
                    <div className="mt-2">{getStatusBadge(request.status)}</div>
                  </div>
                  <div className="font-semibold text-lg">{formatAmount(Number(request.amount))}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin: Manage Payout Requests */}
      {isAdminLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin: Manage Payout Requests</CardTitle>
            <CardDescription>Approve or reject payout requests from all users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAllRequests ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : allPayoutRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No payout requests from any users</p>
            ) : (
              <div className="space-y-4">
                {allPayoutRequests.map(([user, requests]) =>
                  requests.map((request) => {
                    const userText = user.toText();
                    return (
                      <div
                        key={`${userText}-${request.id.toString()}`}
                        className="p-4 rounded-lg border border-border space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">Request #{request.id.toString()}</p>
                            <p className="text-sm text-muted-foreground break-all">
                              User: {userText}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTimestamp(Number(request.created) / 1000000)}
                            </p>
                            <div className="mt-2">{getStatusBadge(request.status)}</div>
                          </div>
                          <div className="font-semibold text-lg ml-4">
                            {formatAmount(Number(request.amount))}
                          </div>
                        </div>
                        {request.status === ApprovalStatus.pending && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(user, request.id)}
                              disabled={approvePayoutMutation.isPending || rejectPayoutMutation.isPending}
                            >
                              {approvePayoutMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Approving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approve
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(user, request.id)}
                              disabled={approvePayoutMutation.isPending || rejectPayoutMutation.isPending}
                            >
                              {rejectPayoutMutation.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

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
