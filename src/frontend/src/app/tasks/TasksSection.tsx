import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, ListTodo, Coins, Plus, Upload, Search, FileJson } from 'lucide-react';
import { useAvailableTasks } from './useAvailableTasks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '../auth/useIsAdmin';
import { useAuth } from '../auth/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import AddTaskDialog from './AddTaskDialog';
import BulkUploadTasksDialog from './BulkUploadTasksDialog';
import GooglePayTasksUploadDialog from './GooglePayTasksUploadDialog';

export default function TasksSection() {
  const { data: tasks, isLoading, error } = useAvailableTasks();
  const { isAuthenticated } = useAuth();
  const { data: isAdmin, isLoading: isAdminLoading, isFetched: isAdminFetched } = useIsAdmin();
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [showGooglePayUploadDialog, setShowGooglePayUploadDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on search query
  const filteredTasks = tasks?.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });

  const hasTasks = tasks && tasks.length > 0;
  const hasFilteredResults = filteredTasks && filteredTasks.length > 0;
  const isSearching = searchQuery.trim() !== '';

  // Admin-only UI should show when authenticated AND admin
  const showAdminUI = isAuthenticated && isAdmin;

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Available Tasks</h1>
          <p className="text-muted-foreground">Complete tasks to earn rewards</p>
        </div>
        {isAdminLoading && !isAdminFetched ? (
          <Skeleton className="h-10 w-32" />
        ) : showAdminUI ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowGooglePayUploadDialog(true)}>
              <FileJson className="w-4 h-4 mr-2" />
              Google Pay Tasks
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowBulkUploadDialog(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button size="sm" onClick={() => setShowAddTaskDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        ) : null}
      </div>

      {/* Search input */}
      {hasTasks && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading tasks...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Failed to load tasks. Please try again later.</p>
          </CardContent>
        </Card>
      ) : !hasTasks ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ListTodo className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">No Tasks Available</h3>
                <p className="text-muted-foreground text-sm">
                  {showAdminUI
                    ? 'Click "Add Task" or "Bulk Upload" to create tasks.'
                    : 'Check back later for new tasks to complete and earn rewards.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : !hasFilteredResults && isSearching ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No tasks match your search query. Try a different search term.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks?.map((task, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                    <CardDescription className="text-base">{task.description}</CardDescription>
                  </div>
                  {task.reward !== undefined && task.reward !== null && (
                    <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-sm font-semibold">
                      <Coins className="w-4 h-4" />
                      {task.reward.toString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {showAdminUI && (
        <>
          <AddTaskDialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog} />
          <BulkUploadTasksDialog open={showBulkUploadDialog} onOpenChange={setShowBulkUploadDialog} />
          <GooglePayTasksUploadDialog open={showGooglePayUploadDialog} onOpenChange={setShowGooglePayUploadDialog} />
        </>
      )}
    </div>
  );
}
