import { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import io from 'socket.io-client';
import api, { API_URLS } from '../api';
import TaskCard from './TaskCard.jsx';
import ActivityLog from './ActivityLog.jsx';
import '../styles/KanbanBoard.css';

const socket = io('http://localhost:5000');

function KanbanBoard() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium' });
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    fetchTasks();

    socket.on('taskUpdated', (task) => {
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    });

    socket.on('resolveConflict', ({ taskId, versions }) => {
      setConflict({ taskId, versions });
    });

    return () => {
      socket.off('taskUpdated');
      socket.off('resolveConflict');
    };
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get(API_URLS.TASKS);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert(error.response?.data?.message || 'Failed to fetch tasks');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(API_URLS.TASKS, newTask);
      setTasks([...tasks, response.data]);
      socket.emit('taskUpdate', response.data);
      setNewTask({ title: '', description: '', priority: 'Medium' });
    } catch (error) {
      console.error('Error adding task:', error);
      alert(error.response?.data?.message || 'Failed to add task');
    }
  };

  const handleDrop = async (taskId, newStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    try {
      const response = await api.put(API_URLS.TASK_BY_ID(taskId), {
        ...task,
        status: newStatus,
        version: task.version,
      });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? response.data : t)));
      socket.emit('taskUpdate', response.data);
    } catch (error) {
      if (error.response?.status === 409) {
        setConflict({
          taskId,
          versions: [error.response.data.currentVersion, error.response.data.clientVersion],
        });
        socket.emit('conflictDetected', { taskId, versions: [error.response.data.currentVersion, error.response.data.clientVersion] });
      } else {
        alert(error.response?.data?.message || 'Failed to update task status');
      }
    }
  };

  const handleResolveConflict = async (selectedVersion) => {
    try {
      const response = await api.put(API_URLS.TASK_BY_ID(conflict.taskId), {
        ...selectedVersion,
        version: selectedVersion.version,
      });
      setTasks((prev) => prev.map((t) => (t._id === conflict.taskId ? response.data : t)));
      socket.emit('taskUpdate', response.data);
      setConflict(null);
    } catch (error) {
      console.error('Error resolving conflict:', error);
      alert(error.response?.data?.message || 'Failed to resolve conflict');
    }
  };

  const columns = ['Todo', 'In Progress', 'Done'];

  const Column = ({ status }) => {
    const [{ isOver }, drop] = useDrop({
      accept: 'TASK',
      drop: (item) => handleDrop(item.id, status),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    });

    return (
      <div ref={drop} className={`column ${isOver ? 'highlight' : ''}`}>
        <h3>{status}</h3>
        {tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              setTasks={setTasks}
              socket={socket}
            />
          ))}
      </div>
    );
  };

  return (
    <div className="kanban-board">
      <h2>Collaborative To-Do Board</h2>
      <form className="task-form" onSubmit={handleAddTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button type="submit">Add Task</button>
      </form>

      <div className="columns">
        {columns.map((status) => (
          <Column key={status} status={status} />
        ))}
      </div>

      {conflict && (
        <div className="conflict-modal">
          <h3>Conflict Detected</h3>
          <p>Two users edited the same task. Choose an option:</p>
          {conflict.versions.map((version, index) => (
            <div key={index} className="version">
              <p><strong>Title:</strong> {version.title}</p>
              <p><strong>Description:</strong> {version.description}</p>
              <button onClick={() => handleResolveConflict(version)}>Choose this version</button>
            </div>
          ))}
          <button onClick={() => setConflict(null)}>Cancel</button>
        </div>
      )}

      <ActivityLog socket={socket} />
    </div>
  );
}

export default KanbanBoard;