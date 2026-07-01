'use client';

import React, { useState } from 'react';
import { LayoutGrid, Table as TableIcon, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './tasks.module.css';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'completed';
  owner: string;
  deadline: string;
  status: 'Backlog' | 'In Progress' | 'Under Review' | 'Completed';
  project: string;
  createdBy: string;
  relatedMeeting?: string;
}

const mockTasks: Task[] = [
  {
    id: 'TSK-101',
    title: 'Audit AWS production architecture cost structures',
    priority: 'high',
    owner: 'Sarah Connor',
    deadline: '2026-07-03',
    status: 'In Progress',
    project: 'Cloud Scaling',
    createdBy: 'Vincent',
    relatedMeeting: 'Q2 Financial Review'
  },
  {
    id: 'TSK-102',
    title: 'Verify Project Alpha QA logs and sign-off',
    priority: 'high',
    owner: 'Bob Proctor',
    deadline: '2026-07-05',
    status: 'Backlog',
    project: 'Project Alpha',
    createdBy: 'Vincent',
    relatedMeeting: 'Project Alpha - Status Alignment'
  },
  {
    id: 'TSK-103',
    title: 'Revise board presentation pitch deck copy',
    priority: 'medium',
    owner: 'Vincent N.',
    deadline: '2026-07-10',
    status: 'In Progress',
    project: 'Investor Relations',
    createdBy: 'Sarah Connor',
    relatedMeeting: 'Investor Prep & Pitch Review'
  },
  {
    id: 'TSK-104',
    title: 'Authorize travel reimbursements for engineering team',
    priority: 'completed',
    owner: 'Vincent N.',
    deadline: '2026-06-30',
    status: 'Completed',
    project: 'Operations',
    createdBy: 'System',
    relatedMeeting: 'None'
  }
];

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');

  const getPriorityVariant = (p: Task['priority']) => {
    if (p === 'high') return 'red';
    if (p === 'medium') return 'orange';
    return 'green';
  };

  const getStatusTasks = (status: Task['status']) => mockTasks.filter(t => t.status === status);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Task Manager</h1>
          <p>Track project items, assignees, deadlines, and active status.</p>
        </div>
        <div className={styles.actions}>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${view === 'kanban' ? styles.activeToggle : ''}`}
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button 
              className={`${styles.toggleBtn} ${view === 'table' ? styles.activeToggle : ''}`}
              onClick={() => setView('table')}
            >
              <TableIcon className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>New Task</Button>
        </div>
      </div>

      {view === 'kanban' ? (
        <div className={styles.kanbanBoard}>
          {(['Backlog', 'In Progress', 'Under Review', 'Completed'] as const).map(status => (
            <div key={status} className={styles.kanbanColumn}>
              <div className={styles.columnHeader}>
                <h3>{status}</h3>
                <span className={styles.columnCount}>{getStatusTasks(status).length}</span>
              </div>
              <div className={styles.columnContent}>
                {getStatusTasks(status).map(task => (
                  <div key={task.id} className={styles.kanbanCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.taskId}>{task.id}</span>
                      <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                    </div>
                    <h4 className={styles.cardTitle}>{task.title}</h4>
                    <div className={styles.cardFooter}>
                      <div className={styles.cardMeta}>
                        <span>Due: {task.deadline}</span>
                        <span>•</span>
                        <span>{task.project}</span>
                      </div>
                      <div className={styles.ownerAvatar} title={`Owner: ${task.owner}`}>
                        {task.owner.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Owner</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Project</th>
                <th>Related Meeting</th>
              </tr>
            </thead>
            <tbody>
              {mockTasks.map(task => (
                <tr key={task.id}>
                  <td><strong>{task.id}</strong></td>
                  <td>{task.title}</td>
                  <td>
                    <Badge variant={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                  </td>
                  <td>{task.owner}</td>
                  <td>{task.deadline}</td>
                  <td>{task.status}</td>
                  <td>{task.project}</td>
                  <td><span className={styles.meetingText}>{task.relatedMeeting || 'None'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
