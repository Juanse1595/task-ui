import { useState, useEffect } from 'react';
import './App.css';

interface Task {
  taskId: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create a new task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      if (!response.ok) throw new Error('Failed to create task');
      setNewTaskTitle('');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  // Toggle task completion
  const handleToggleTask = async (task: Task) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Update task title
  const handleUpdateTask = async (taskId: string) => {
    if (!editingTitle.trim()) return;
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      setEditingTaskId(null);
      setEditingTitle('');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="app-container">
      <div className="todo-container">
        <h1>📝 My Tasks</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCreateTask} className="create-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a new task..."
            className="task-input"
          />
          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </form>

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">No tasks yet. Create one above!</div>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.taskId} className={`task-item ${task.completed ? 'completed' : ''}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task)}
                    className="task-checkbox"
                  />
                  {editingTaskId === task.taskId ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleUpdateTask(task.taskId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateTask(task.taskId);
                        if (e.key === 'Escape') setEditingTaskId(null);
                      }}
                      autoFocus
                      className="task-edit-input"
                    />
                  ) : (
                    <span
                      onClick={() => {
                        setEditingTaskId(task.taskId);
                        setEditingTitle(task.title);
                      }}
                      className="task-title"
                    >
                      {task.title}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTask(task.taskId)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="task-stats">
          {tasks.length > 0 && (
            <>
              <span>Total: {tasks.length}</span>
              <span>Completed: {tasks.filter((t) => t.completed).length}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
