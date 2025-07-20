import { useState } from 'react';
import { useDrag } from 'react-dnd';
import api, { API_URLS } from '../api';
import '../styles/TaskCard.css';

function TaskCard({ task, setTasks, socket }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState(task);

  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleUpdate = async () => {
    try {
      const response = await api.put(API_URLS.TASK_BY_ID(task._id), {
        ...editTask,
        version: task.version,
      });
      setTasks((prev) => prev.map((t) => (t._id === task._id ? response.data : t)));
      socket.emit('taskUpdate', response.data);
      setIsEditing(false);
      alert('Task updated successfully');
    } catch (error) {
      if (error.response?.status === 409) {
        socket.emit('conflictDetected', {
          taskId: task._id,
          versions: [error.response.data.currentVersion, error.response.data.clientVersion],
        });
      } else {
        alert(error.response?.data?.message || 'Failed to update task');
      }
    }
  };

  const handleDelete = async () => {
    try {
      console.log('Deleting task:', task._id);
      await api.delete(API_URLS.TASK_BY_ID(task._id));
      setTasks((prev) => prev.filter((t) => t._id !== task._id));
      socket.emit('taskUpdate', { _id: task._id, deleted: true });
      alert('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleSmartAssign = async () => {
    try {
      const response = await api.post(API_URLS.SMART_ASSIGN(task._id), {});
      setTasks((prev) => prev.map((t) => (t._id === task._id ? response.data : t)));
      socket.emit('taskUpdate', response.data);
      alert(`Task successfully assigned to ${response.data.assignedUser?.username || 'a user'}`);
    } catch (error) {
      console.error('Error smart assigning:', error);
      alert(error.response?.data?.message || 'Failed to smart assign task');
    }
  };

  return (
    <div ref={drag} className={`task-card ${isDragging ? 'dragging' : ''}`}>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editTask.title}
            onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
          />
          <textarea
            value={editTask.description}
            onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
          />
          <select
            value={editTask.priority}
            onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <h4>{task.title}</h4>
          <p>{task.description}</p>
          <p><strong>Priority:</strong> {task.priority}</p>
          <p><strong>Assigned:</strong> {task.assignedUser?.username || 'Unassigned'}</p>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleSmartAssign}>Smart Assign</button>
        </div>
      )}
    </div>
  );
}

export default TaskCard;