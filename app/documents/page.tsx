'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/lib/store';
import { cn } from '@/utils/cn';
import { Project, Task, UserProfile as User } from '@/types';
import { projectsService } from '@/services/projects';
import { tasksService } from '@/services/tasks';
import { usersService } from '@/services/users';
import {
  Upload,
  FileText,
  Lock,
  Users,
  FolderKanban,
  CheckSquare,
  Loader2,
  Trash2,
  Eye,
  Copy,
  Check,
  ShieldAlert,
  Calendar,
  X,
  UserCheck,
} from 'lucide-react';

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getFormHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

interface DocRecord {
  id: number;
  title: string;
  s3_key: string;
  url: string;
  access_type: 'code' | 'access';
  passcode: string | null;
  project_id: number | null;
  project_name: string | null;
  task_id: number | null;
  task_title: string | null;
  uploaded_by_id: number;
  uploader_name: string | null;
  allowed_user_ids: number[];
  created_at: string | null;
}

export default function DocumentHub() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userProfile } = useStore();
  const currentUserId = userProfile.id ? String(userProfile.id) : '';
  const isCEO = ['ceo', 'super_admin', 'admin'].includes(String(userProfile.role || '').toLowerCase());

  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [accessType, setAccessType] = useState<'code' | 'access'>('code');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Unlock state
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockingDocId, setUnlockingDocId] = useState<number | null>(null);
  const [copiedPasscode, setCopiedPasscode] = useState<string | null>(null);
  const [justUploadedPasscode, setJustUploadedPasscode] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/documents', { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to fetch documents');
      const json = await res.json();
      setDocuments(json.data || []);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [projData, taskData, userData] = await Promise.all([
          projectsService.getProjects(),
          tasksService.getTasks(),
          usersService.getUsers(),
        ]);
        setProjects(projData);
        setUsers(userData);
        // Filter tasks assigned to current user
        const myTasks = taskData.filter(t => t.assignedTo?.id === currentUserId);
        setTasks(myTasks);
      } catch (error) {
        console.error('Failed to load form data', error);
      }
    };
    load();
    fetchDocuments();
  }, [fetchDocuments, currentUserId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    if (accessType === 'access' && selectedUserIds.length === 0) {
      alert('Please select at least one user to grant access to.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('access_type', accessType);
      formData.append('file', file);
      if (projectId) formData.append('project_id', String(projectId));
      if (taskId) formData.append('task_id', String(taskId));
      if (accessType === 'access') {
        formData.append('allowed_users', JSON.stringify(selectedUserIds));
      }

      const res = await fetch('/api/v1/documents', {
        method: 'POST',
        headers: getFormHeaders(),
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      if (json.data?.passcode) {
        setJustUploadedPasscode(json.data.passcode);
      }
      setTitle('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setProjectId('');
      setTaskId('');
      setSelectedUserIds([]);
      setAccessType('code');
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to upload document', error);
      alert('Upload failed. Make sure AWS S3 is configured on the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/v1/documents/${docId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchDocuments();
    } catch (error) {
      alert('Failed to delete document.');
    }
  };

  const handleUnlock = async (docId: number) => {
    try {
      const params = new URLSearchParams();
      if (unlockCode) params.append('passcode', unlockCode);
      const res = await fetch(`/api/v1/documents/${docId}/url?${params.toString()}`, {
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.detail || 'Invalid passcode or access denied.');
        return;
      }
      window.open(json.data.url, '_blank');
      setUnlockingDocId(null);
      setUnlockCode('');
    } catch {
      alert('Invalid passcode or access denied.');
    }
  };

  const copyPasscode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPasscode(code);
    setTimeout(() => setCopiedPasscode(null), 2000);
  };

  const toggleUserSelection = (uid: number) => {
    setSelectedUserIds(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const myDocuments = documents.filter(d => String(d.uploaded_by_id) === currentUserId);
  const sharedWithMe = documents.filter(d => String(d.uploaded_by_id) !== currentUserId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-text-primary">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background-secondary p-4 rounded-lg border border-border-subtle shadow-md">
        <div>
          <h2 className="text-base font-bold font-sans">Document Hub</h2>
          <p className="text-2xs text-text-secondary mt-0.5">Upload, organize, and securely share documents with passcode or access-based protection.</p>
        </div>
      </div>

      {/* Uploaded passcode notification */}
      {justUploadedPasscode && (
        <div className="bg-accent-green/[0.08] border border-accent-green/30 rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-accent-green" />
            <div>
              <p className="text-xs font-bold text-accent-green">Document uploaded — save this passcode!</p>
              <p className="text-2xs text-text-secondary mt-0.5">Share this passcode with anyone who needs access.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="bg-background-primary border border-accent-green/30 text-accent-green font-mono font-extrabold text-sm px-3 py-1 rounded">{justUploadedPasscode}</code>
            <button onClick={() => copyPasscode(justUploadedPasscode)} className="p-1.5 rounded hover:bg-background-primary text-text-muted hover:text-accent-green transition-colors">
              {copiedPasscode === justUploadedPasscode ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={() => setJustUploadedPasscode(null)} className="p-1.5 rounded hover:bg-background-primary text-text-muted hover:text-text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="bg-background-secondary border border-border-subtle rounded-lg p-5 shadow-md">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <Upload className="w-4 h-4 text-accent-blue" /> Upload New Document
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">Title</label>
              <input
                type="text"
                placeholder="e.g. Q3 Financial Report"
                className="w-full bg-background-primary border border-border-subtle rounded-md px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-blue transition-colors placeholder:text-text-muted"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase">File</label>
              <input
                type="file"
                ref={fileInputRef}
                className="w-full bg-background-primary border border-border-subtle rounded-md px-3 py-1.5 text-sm text-text-primary file:mr-3 file:py-0.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-accent-blue/10 file:text-accent-blue hover:file:bg-accent-blue/20"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase flex items-center gap-1">
                <FolderKanban className="w-3 h-3" /> Project
              </label>
              <select
                className="w-full h-10 bg-background-primary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none focus:border-accent-blue transition-colors"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setTaskId('');
                }}
              >
                <option value="">No Project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-2xs font-bold text-text-secondary uppercase flex items-center gap-1">
                <CheckSquare className="w-3 h-3" /> Task (Assigned to You)
              </label>
              <select
                className="w-full h-10 bg-background-primary border border-border-subtle rounded-md px-3 text-sm text-text-primary outline-none focus:border-accent-blue transition-colors"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
              >
                <option value="">No Task</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              {tasks.length === 0 && (
                <p className="text-[10px] text-text-muted italic">No tasks assigned to you yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-bold text-text-secondary uppercase">Security Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAccessType('code')}
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-2.5 rounded-md border text-xs font-semibold transition-colors",
                  accessType === 'code'
                    ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                    : 'bg-background-primary border-border-subtle text-text-secondary hover:text-text-primary'
                )}
              >
                <Lock className="w-3.5 h-3.5" /> Passcode Protected
              </button>
              <button
                type="button"
                onClick={() => setAccessType('access')}
                className={cn(
                  "flex-1 flex items-center gap-2 px-4 py-2.5 rounded-md border text-xs font-semibold transition-colors",
                  accessType === 'access'
                    ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue'
                    : 'bg-background-primary border-border-subtle text-text-secondary hover:text-text-primary'
                )}
              >
                <Users className="w-3.5 h-3.5" /> Access Based
              </button>
            </div>
            <p className="text-[10px] text-text-muted">
              {accessType === 'code'
                ? 'An auto-generated passcode is required to view the document.'
                : 'Only selected users can access this document.'}
            </p>
          </div>

          {accessType === 'access' && (
            <div className="space-y-2">
              <label className="text-2xs font-bold text-text-secondary uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Grant Access To
              </label>
              <div className="bg-background-primary border border-border-subtle rounded-md p-3 max-h-40 overflow-y-auto space-y-1">
                {users.filter(u => String(u.id) !== currentUserId).map(u => (
                  <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-card/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(Number(u.id))}
                      onChange={() => toggleUserSelection(Number(u.id))}
                      className="rounded border-border-subtle accent-accent-blue"
                    />
                    <span className="font-semibold text-text-primary">{u.name}</span>
                    <span className="text-text-muted">— {u.role}{u.department ? ` (${u.department})` : ''}</span>
                  </label>
                ))}
                {users.filter(u => String(u.id) !== currentUserId).length === 0 && (
                  <p className="text-[10px] text-text-muted italic py-2 text-center">No other users available.</p>
                )}
              </div>
              {selectedUserIds.length > 0 && (
                <p className="text-[10px] text-accent-blue font-semibold">{selectedUserIds.length} user(s) selected</p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !file || !title}
            className="flex items-center gap-2 px-5 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded-md shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Upload className="w-3.5 h-3.5" />
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* My Documents */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-accent-blue" /> My Documents ({myDocuments.length})
        </h3>
        {pageLoading ? (
          <div className="flex items-center justify-center py-12 text-text-muted">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading...
          </div>
        ) : myDocuments.length === 0 ? (
          <div className="bg-background-secondary border border-border-subtle rounded-lg p-8 text-center text-text-muted text-xs">
            No documents yet. Upload your first document above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myDocuments.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isOwner
                canDelete={true}
                onDelete={handleDelete}
                onUnlock={handleUnlock}
                unlockingDocId={unlockingDocId}
                setUnlockingDocId={setUnlockingDocId}
                unlockCode={unlockCode}
                setUnlockCode={setUnlockCode}
                copyPasscode={copyPasscode}
                copiedPasscode={copiedPasscode}
                users={users}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared with me */}
      {sharedWithMe.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-accent-purple" /> Shared With Me ({sharedWithMe.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedWithMe.map(doc => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isOwner={false}
                canDelete={isCEO}
                onDelete={handleDelete}
                onUnlock={handleUnlock}
                unlockingDocId={unlockingDocId}
                setUnlockingDocId={setUnlockingDocId}
                unlockCode={unlockCode}
                setUnlockCode={setUnlockCode}
                copyPasscode={copyPasscode}
                copiedPasscode={copiedPasscode}
                users={users}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc, isOwner, canDelete, onDelete, onUnlock, unlockingDocId, setUnlockingDocId, unlockCode, setUnlockCode, copyPasscode, copiedPasscode, users }: {
  doc: DocRecord;
  isOwner: boolean;
  canDelete?: boolean;
  onDelete: (id: number) => void;
  onUnlock: (id: number) => void;
  unlockingDocId: number | null;
  setUnlockingDocId: (id: number | null) => void;
  unlockCode: string;
  setUnlockCode: (code: string) => void;
  copyPasscode: (code: string) => void;
  copiedPasscode: string | null;
  users: User[];
}) {
  const isUnlocking = unlockingDocId === doc.id;
  const isCodeProtected = doc.access_type === 'code';

  const allowedUsers = users.filter(u => doc.allowed_user_ids.includes(Number(u.id)));

  return (
    <div className="bg-background-secondary border border-border-subtle rounded-lg p-4 space-y-3 shadow-sm hover:border-text-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            isCodeProtected ? 'bg-accent-orange/10 text-accent-orange' : 'bg-accent-purple/10 text-accent-purple'
          )}>
            {isCodeProtected ? <Lock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-text-primary truncate">{doc.title}</h4>
            <p className="text-[10px] text-text-muted">{isCodeProtected ? 'Passcode Protected' : 'Access Based'}</p>
          </div>
        </div>
        {(canDelete ?? isOwner) && (
          <button onClick={() => onDelete(doc.id)} className="p-1 rounded hover:bg-accent-red/10 text-text-muted hover:text-accent-red transition-colors shrink-0" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-[10px]">
        {doc.project_name && (
          <span className="flex items-center gap-1 bg-accent-blue/10 text-accent-blue px-2 py-0.5 rounded font-semibold">
            <FolderKanban className="w-2.5 h-2.5" />{doc.project_name}
          </span>
        )}
        {doc.task_title && (
          <span className="flex items-center gap-1 bg-accent-green/10 text-accent-green px-2 py-0.5 rounded font-semibold">
            <CheckSquare className="w-2.5 h-2.5" />{doc.task_title}
          </span>
        )}
      </div>

      {/* Access info */}
      {isCodeProtected ? (
        doc.passcode && isOwner ? (
          <div className="flex items-center gap-2 bg-background-primary border border-border-subtle rounded px-2 py-1.5">
            <code className="text-[10px] font-mono font-bold text-accent-orange flex-1">{doc.passcode}</code>
            <button onClick={() => copyPasscode(doc.passcode!)} className="text-text-muted hover:text-accent-blue transition-colors">
              {copiedPasscode === doc.passcode ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ) : isUnlocking ? (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter passcode"
              className="flex-1 bg-background-primary border border-border-subtle rounded px-2 py-1.5 text-xs text-text-primary outline-none focus:border-accent-blue"
              value={unlockCode}
              onChange={(e) => setUnlockCode(e.target.value)}
            />
            <button onClick={() => onUnlock(doc.id)} className="bg-accent-green hover:bg-accent-green/80 px-3 py-1.5 rounded text-xs font-semibold text-white transition-colors">
              <Eye className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button onClick={() => { setUnlockingDocId(doc.id); setUnlockCode(''); }} className="flex items-center gap-1.5 w-full bg-background-primary border border-border-subtle rounded px-3 py-2 text-xs text-text-secondary hover:text-text-primary transition-colors">
            <Lock className="w-3 h-3" /> Enter passcode to view
          </button>
        )
      ) : (
        <div className="space-y-1">
          <p className="text-[10px] text-text-muted font-semibold uppercase">Accessible by:</p>
          <div className="flex flex-wrap gap-1">
            {allowedUsers.length > 0 ? allowedUsers.map(u => (
              <span key={u.id} className="text-[10px] bg-accent-purple/10 text-accent-purple px-1.5 py-0.5 rounded font-semibold">{u.name}</span>
            )) : (
              <span className="text-[10px] text-text-muted italic">Only owner</span>
            )}
          </div>
          <button onClick={() => onUnlock(doc.id)} className="flex items-center gap-1.5 mt-1 text-[10px] text-accent-blue hover:text-accent-blue-hover font-semibold transition-colors">
            <Eye className="w-3 h-3" /> Open Document
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border-subtle">
        <span className="flex items-center gap-1">
          <Calendar className="w-2.5 h-2.5" />
          {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '—'}
        </span>
        {doc.uploader_name && !isOwner && (
          <span>by {doc.uploader_name}</span>
        )}
      </div>
    </div>
  );
}
