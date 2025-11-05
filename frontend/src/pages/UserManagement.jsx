import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../utils/config';
import './UserManagement.css';

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Normalize approved/enabled to booleans (handle SQLite 0/1)
  // This must be done before any conditional returns (Rules of Hooks)
  const normalizedUsers = (users || []).map(u => ({
    ...u,
    approved: u.approved === 1 || u.approved === true || Boolean(u.approved),
    enabled: u.enabled === 1 || u.enabled === true || Boolean(u.enabled)
  }));

  const trainees = normalizedUsers.filter(u => u.role === 'trainee');
  const pendingApproval = trainees.filter(u => !u.approved);
  const approved = trainees.filter(u => u.approved);
  const disabled = normalizedUsers.filter(u => !u.enabled);

  // Filter users based on search and filters - MUST be before conditional returns
  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter(u => {
      const matchesSearch = searchQuery === '' || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = filterRole === 'all' || u.role === filterRole;
      
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'pending' && u.role === 'trainee' && !u.approved) ||
        (filterStatus === 'approved' && u.role === 'trainee' && u.approved) ||
        (filterStatus === 'disabled' && !u.enabled) ||
        (filterStatus === 'enabled' && u.enabled);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [normalizedUsers, searchQuery, filterRole, filterStatus]);

  useEffect(() => {
    if (!user || user.role !== 'trainer') {
      navigate('/trainer');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
        setError(null);
      } else {
        // Try to get error details from response
        let errorMessage = 'Failed to load users';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          errorDetails = errorData.message || errorData.details || '';
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Failed to load users: ${response.status} ${response.statusText}`;
        }

        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Trainer access required.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
          errorDetails = errorDetails || 'The server encountered an error while processing your request.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not found. Please check the server configuration.';
        }

        setError(errorDetails ? `${errorMessage}\n\nDetails: ${errorDetails}` : errorMessage);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Network error: Cannot connect to server. Please check your internet connection and ensure the backend server is running.');
      } else {
        setError(`Failed to load users: ${error.message || 'Unknown error occurred'}`);
      }
      } finally {
        setLoading(false);
      }
    };

  const handleApprove = async (userId) => {
    if (!window.confirm('Approve this user?')) return;

    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      const token = localStorage.getItem('token');
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await loadUsers();
      } else {
        let errorMessage = 'Failed to approve user';
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch (e) {
          errorMessage = `Failed to approve user: ${response.status} ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleDisable = async (userId, userName) => {
    if (!window.confirm(`Disable user "${userName}"? They will not be able to access resources.`)) return;

    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      const token = localStorage.getItem('token');
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}/disable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadUsers();
      } else {
        let errorMessage = 'Failed to disable user';
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch (e) {
          errorMessage = `Failed to disable user: ${response.status} ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error disabling user:', error);
      alert('Failed to disable user');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleEnable = async (userId) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      const token = localStorage.getItem('token');
      const response = await fetch(`${getBackendUrl()}/api/users/${userId}/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadUsers();
      } else {
        let errorMessage = 'Failed to enable user';
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
        } catch (e) {
          errorMessage = `Failed to enable user: ${response.status} ${response.statusText}`;
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error enabling user:', error);
      alert('Failed to enable user');
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This action cannot be undone and will delete all their submissions.`)) return;

    try {
      setActionLoading({ ...actionLoading, [userId]: true });
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No authentication token found. Please log in again.');
        return;
      }

      const backendUrl = getBackendUrl();
      console.log(`[UserManagement] Deleting user ${userId} via ${backendUrl}/api/users/${userId}`);
      
      const response = await fetch(`${backendUrl}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[UserManagement] Delete response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('[UserManagement] Delete successful:', data);
        alert('User deleted successfully');
        await loadUsers();
      } else {
        let errorMessage = 'Failed to delete user';
        let errorDetails = '';
        
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
          errorDetails = data.message || data.details || '';
          console.error('[UserManagement] Delete error response:', data);
        } catch (e) {
          const responseText = await response.text();
          errorMessage = `Failed to delete user: ${response.status} ${response.statusText}`;
          errorDetails = responseText || '';
          console.error('[UserManagement] Delete error (non-JSON):', responseText);
        }
        
        alert(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
      }
    } catch (error) {
      console.error('[UserManagement] Error deleting user:', error);
      alert(`Failed to delete user: ${error.message || 'Network error'}`);
    } finally {
      setActionLoading({ ...actionLoading, [userId]: false });
    }
  };

  if (loading) {
    return (
      <div className="user-management" style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #090d11, #0a1015)' }}>
        <div className="user-management-header">
          <h1 style={{ color: '#3bb6ff', margin: 0 }}>User Management</h1>
        </div>
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management" style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #090d11, #0a1015)' }}>
        <div className="user-management-header">
          <h1 style={{ color: '#3bb6ff', margin: 0 }}>User Management</h1>
          <button onClick={loadUsers} className="refresh-btn">🔄 Retry</button>
        </div>
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Error Loading Users</h2>
          <div className="error-message">{error.split('\n\n').map((line, idx) => (
            <p key={idx} style={{ marginBottom: idx === 0 ? '10px' : '5px' }}>{line}</p>
          ))}</div>
          <button 
            onClick={loadUsers} 
            className="retry-button"
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3bb6ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="user-management" style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #090d11, #0a1015)', padding: '16px 24px', color: '#eaf2f9' }}>
      <div className="user-management-header">
        <div className="header-left">
          <h1 style={{ color: '#3bb6ff', margin: 0, fontSize: '22px' }}>User Management</h1>
          <span className="user-count" style={{ color: '#9fb2c3', fontSize: '13px' }}>{normalizedUsers.length} {normalizedUsers.length === 1 ? 'user' : 'users'}</span>
        </div>
        <button onClick={loadUsers} className="refresh-btn" title="Refresh users">
          <span className="refresh-icon">↻</span>
          Refresh
        </button>
      </div>

      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{trainees.length}</div>
            <div className="stat-label">Trainees</div>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{pendingApproval.length}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{approved.length}</div>
            <div className="stat-label">Approved</div>
          </div>
        </div>
        <div className="stat-card disabled">
          <div className="stat-icon">🚫</div>
          <div className="stat-content">
            <div className="stat-number">{disabled.length}</div>
            <div className="stat-label">Disabled</div>
          </div>
        </div>
      </div>

      <div className="users-section">
        <div className="section-header">
          <h2>Users</h2>
          <div className="filters">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Roles</option>
              <option value="trainer">Trainers</option>
              <option value="trainee">Trainees</option>
            </select>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Approved Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-results">
                    {searchQuery || filterRole !== 'all' || filterStatus !== 'all' 
                      ? 'No users match your filters' 
                      : 'No users found'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className={!u.enabled ? 'disabled-row' : ''}>
                    <td className="user-info">
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'trainer' ? 'badge-trainer' : 'badge-trainee'}`}>
                        {u.role === 'trainer' ? 'Trainer' : 'Trainee'}
                      </span>
                    </td>
                    <td>
                      <div className="status-group">
                        {u.role === 'trainer' ? (
                          <span className="badge badge-auto">Auto Approved</span>
                        ) : (
                          <>
                            <span className={`badge ${u.approved ? 'badge-approved' : 'badge-pending'}`}>
                              {u.approved ? '✓ Approved' : '⏳ Pending'}
                            </span>
                            <span className={`badge ${u.enabled ? 'badge-enabled' : 'badge-disabled'}`}>
                              {u.enabled ? '✓ Active' : '✗ Disabled'}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      {u.role === 'trainer' ? (
                        <span style={{color: 'var(--muted)', fontSize: '12px'}}>—</span>
                      ) : u.approved && u.updated_at ? (
                        <span style={{color: 'var(--text)', fontSize: '12px'}}>
                          {new Date(u.updated_at).toLocaleDateString()}
                        </span>
                      ) : u.approved ? (
                        <span style={{color: 'var(--muted)', fontSize: '12px', fontStyle: 'italic'}}>Not available</span>
                      ) : (
                        <span style={{color: 'var(--muted)', fontSize: '12px'}}>—</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {u.role === 'trainee' && !u.approved && (
                          <button
                            onClick={() => handleApprove(u.id)}
                            disabled={actionLoading[u.id]}
                            className="action-btn btn-approve"
                            title="Approve user"
                          >
                            {actionLoading[u.id] ? '⋯' : '✓'}
                          </button>
                        )}
                        {u.enabled && u.role === 'trainee' && (
                          <button
                            onClick={() => handleDisable(u.id, u.name)}
                            disabled={actionLoading[u.id]}
                            className="action-btn btn-disable"
                            title="Disable user"
                          >
                            {actionLoading[u.id] ? '⋯' : '⏸'}
                          </button>
                        )}
                        {!u.enabled && u.role === 'trainee' && (
                          <button
                            onClick={() => handleEnable(u.id)}
                            disabled={actionLoading[u.id]}
                            className="action-btn btn-enable"
                            title="Enable user"
                          >
                            {actionLoading[u.id] ? '⋯' : '▶'}
                          </button>
                        )}
                        {u.role === 'trainee' && u.id !== user?.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={actionLoading[u.id]}
                            className="action-btn btn-delete"
                            title="Delete user"
                          >
                            {actionLoading[u.id] ? '⋯' : '🗑'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

