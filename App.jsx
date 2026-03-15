import { useEffect, useMemo, useState } from 'react';
import './App.css';

function App() {
  // Load once from localStorage
  const [taskList, setTaskList] = useState(() => {
    const saved = localStorage.getItem('TaskList');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Persist to localStorage when taskList changes
  useEffect(() => {
    localStorage.setItem('TaskList', JSON.stringify(taskList));
  }, [taskList]);

  // Derived, filtered list
  const visibleTasks = useMemo(() => {
    switch (filter) {
      case 'active':
        return taskList.filter(t => !t.completed);
      case 'completed':
        return taskList.filter(t => t.completed);
      default:
        return taskList;
    }
  }, [taskList, filter]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = newTask.trim();
    if (!text) return;

    const task = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
    };

    setTaskList(prev => [task, ...prev]); // prepend newest
    setNewTask('');
  };

  const toggleComplete = (id) => {
    setTaskList(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id) => {
    setTaskList(prev => prev.filter(t => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditText('');
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const saveEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setTaskList(prev =>
      prev.map(t => (t.id === id ? { ...t, text: trimmed } : t))
    );
    setEditingId(null);
    setEditText('');
  };

  const clearCompleted = () => {
    setTaskList(prev => prev.filter(t => !t.completed));
  };

  const stats = useMemo(() => {
    const total = taskList.length;
    const completed = taskList.filter(t => t.completed).length;
    const active = total - completed;
    return { total, completed, active };
  }, [taskList]);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Tasks</h1>
          <p className="subtitle">Stay organized. Stay focused.</p>
        </header>

        {/* Add Task */}
        <form className="add-form" onSubmit={handleSubmit} autoComplete="off" role="search">
          <input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            type="text"
            id="input-task-text"
            placeholder="Add a new task..."
            className="input"
            aria-label="Task input"
          />
          <button type="submit" className="btn primary">Add</button>
        </form>

        {/* Filters + Stats */}
        <div className="toolbar">
          <div className="filters" role="tablist" aria-label="Task filters">
            <button
              className={`chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              role="tab"
              aria-selected={filter === 'all'}
            >
              All ({stats.total})
            </button>
            <button
              className={`chip ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
              role="tab"
              aria-selected={filter === 'active'}
            >
              Active ({stats.active})
            </button>
            <button
              className={`chip ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
              role="tab"
              aria-selected={filter === 'completed'}
            >
              Completed ({stats.completed})
            </button>
          </div>
          <button
            className="btn subtle"
            onClick={clearCompleted}
            disabled={stats.completed === 0}
            title="Remove all completed tasks"
          >
            Clear completed
          </button>
        </div>

        {/* Task List */}
        <ul className="list" role="list" aria-live="polite">
          {visibleTasks.length === 0 ? (
            <li className="empty">No tasks here—add one above ✨</li>
          ) : (
            visibleTasks.map((task) => (
              <li key={task.id} className={`item ${task.completed ? 'done' : ''}`}>
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    aria-label={`Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`}
                  />
                  <span className="check"></span>
                </label>

                {/* Text or Edit Mode */}
                {editingId === task.id ? (
                  <div className="edit-row">
                    <input
                      className="input edit"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <div className="actions">
                      <button className="btn primary small" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button className="btn subtle small" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text" title={task.text}>{task.text}</span>
                    <div className="actions">
                      <button className="btn ghost small" onClick={() => startEdit(task)} title="Edit">
                        Edit
                      </button>
                      <button className="btn danger small" onClick={() => deleteTask(task.id)} title="Delete">
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

        {/* <footer className="footer">
          <span className="hint">
            Tip: Press <kbd>Enter</kbd> to add, <kbd>Esc</kbd> to cancel edit.
          </span>
        </footer> */}
      </div>
    </div>
  );
}

export default App;