import { useState } from 'react';
import { CheckCircle2, Circle, Clock, FileText, MessageSquare, Bell, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'complete';
  requestedBy: string;
  priority: 'low' | 'medium' | 'high';
}

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Upload W-2 Forms',
    description: 'Please upload all W-2 forms for tax year 2024',
    dueDate: '2024-02-15',
    status: 'pending',
    requestedBy: 'Emily Rodriguez',
    priority: 'high',
  },
  {
    id: '2',
    title: 'Review & Sign Organizer',
    description: 'Please review the tax organizer we prepared and confirm accuracy',
    dueDate: '2024-02-20',
    status: 'in-progress',
    requestedBy: 'Sarah Johnson',
    priority: 'medium',
  },
  {
    id: '3',
    title: 'Provide Estimated Tax Payment Info',
    description: 'Send us records of any estimated tax payments made in 2024',
    dueDate: '2024-02-28',
    status: 'pending',
    requestedBy: 'Emily Rodriguez',
    priority: 'medium',
  },
];

const messages = [
  {
    id: '1',
    from: 'Emily Rodriguez',
    preview: 'I reviewed your W-2s and have a quick question about...',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: '2',
    from: 'David Kim',
    preview: 'Your tax organizer is ready for review',
    time: 'Yesterday',
    unread: false,
  },
];

export function ClientPortal() {
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'complete');

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-amber-100 text-amber-700',
      low: 'bg-slate-100 text-slate-700',
    };
    return (
      <Badge className={colors[priority]} variant="secondary">
        {priority}
      </Badge>
    );
  };

  const markComplete = (taskId: string) => {
    setTasks(
      tasks.map((t) => (t.id === taskId ? { ...t, status: 'complete' as const } : t))
    );
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Welcome Back, John</h1>
          <p className="text-slate-600">Here's what needs your attention</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Open Tasks</p>
                <p className="text-slate-900">{pendingTasks.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Unread Messages</p>
                <p className="text-slate-900">
                  {messages.filter((m) => m.unread).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-1">Upcoming Appointment</p>
                <p className="text-slate-900">Feb 20, 10am</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Tasks */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Your To-Do List</h2>
              <div className="space-y-3">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p>All caught up! No pending tasks.</p>
                  </div>
                ) : (
                  pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(task.status)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-slate-900">{task.title}</h3>
                            {getPriorityBadge(task.priority)}
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span>Requested by {task.requestedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="text-slate-900 mb-4">Completed</h2>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 border border-green-200 bg-green-50 rounded-lg opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-slate-700 line-through">
                          {task.title}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Messages & Notifications */}
          <div className="space-y-6">
            {/* Messages */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-slate-900">Messages</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {messages.filter((m) => m.unread).length} new
                </Badge>
              </div>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      message.unread
                        ? 'bg-blue-50 border-2 border-blue-200'
                        : 'bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-1">
                      {message.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{message.from}</p>
                        <p className="text-xs text-slate-600 mt-1">{message.preview}</p>
                        <p className="text-xs text-slate-500 mt-2">{message.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Messages
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <FileText className="w-4 h-4" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Meeting
                </Button>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100 p-6">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-slate-900 mb-2">Tax Season Tip</h3>
                  <p className="text-sm text-slate-700">
                    Upload documents as you receive them — don't wait until the deadline.
                    It helps us serve you faster!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedTask(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-slate-900">{selectedTask.title}</h2>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <p className="text-slate-600 mb-4">{selectedTask.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Due {new Date(selectedTask.dueDate).toLocaleDateString()}
                  </span>
                  <span>Requested by {selectedTask.requestedBy}</span>
                </div>
              </div>

              {/* Upload Area */}
              <div className="mb-6 p-6 border-2 border-dashed border-slate-300 rounded-lg text-center">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-700 mb-2">Drag and drop files here</p>
                <p className="text-sm text-slate-500 mb-4">or</p>
                <Button variant="outline">Browse Files</Button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => markComplete(selectedTask.id)}
                  className="ml-auto gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
