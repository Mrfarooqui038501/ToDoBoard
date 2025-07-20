import { useState, useEffect } from 'react';
import api, { API_URLS } from '../api';
import '../styles/ActivityLog.css';

function ActivityLog({ socket }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();

    socket.on('actionLogged', (log) => {
      console.log('Received action log:', log);
      setLogs((prev) => [log, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.off('actionLogged');
    };
  }, [socket]);

  const fetchLogs = async () => {
    try {
      const response = await api.get(API_URLS.ACTIONS);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      alert(error.response?.data?.message || 'Failed to fetch activity logs');
    }
  };

  return (
    <div className="activity-log">
      <h3>Activity Log</h3>
      <ul>
        {logs.length === 0 ? (
          <li>No activities yet</li>
        ) : (
          logs.map((log) => (
            <li key={log._id}>
              <strong>{log.user?.username || 'System'}</strong> {log.action} at{' '}
              {new Date(log.timestamp).toLocaleString()}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default ActivityLog;