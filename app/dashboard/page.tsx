'use client';

import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  Play
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={styles.container}>
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeText}>
          <h1>Good Morning, Vincent</h1>
          <p>Here is your executive briefing for today.</p>
        </div>
        <div className={styles.dateDisplay}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
            {today}
          </span>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        {/* Left Column - Detailed Views */}
        <div className={styles.leftColumn}>
          
          {/* AI Executive Briefing */}
          <div className={styles.aiBriefingCard}>
            <div className={styles.aiBriefingHeader}>
              <Sparkles className="w-5 h-5" style={{ color: 'var(--accent-blue)' }} />
              <span>AI Executive Assistant Briefing</span>
            </div>
            
            <div className={styles.briefingPoints}>
              <div className={styles.briefingItem}>
                <AlertTriangle className={`${styles.briefingItemIcon} ${styles.briefingItemIconError} w-4 h-4`} />
                <div>
                  <strong>Financial Warning:</strong> AWS billing exceeded Q2 estimates by 14%. Vendor payment of <strong>$12,450</strong> for Acme Corp is overdue. Action recommended to review subscription scaling.
                </div>
              </div>
              <div className={styles.briefingItem}>
                <TrendingUp className={`${styles.briefingItemIcon} ${styles.briefingItemIconWarning} w-4 h-4`} />
                <div>
                  <strong>Project Delay:</strong> Project Alpha is marked as delayed due to resource bottlenecks in frontend QA. Moving Q3 launch by 1 week resolves resource overlap.
                </div>
              </div>
              <div className={styles.briefingItem}>
                <CheckCircle className={`${styles.briefingItemIcon} ${styles.briefingItemIconSuccess} w-4 h-4`} />
                <div>
                  <strong>Success Milestones:</strong> Nurofin completed the Series A Audit with zero compliance failures. Outstanding invoices for June are 92% cleared.
                </div>
              </div>
            </div>

            <div className={styles.suggestionsRow}>
              <button className={styles.suggestionBtn}>What should I focus on today?</button>
              <button className={styles.suggestionBtn}>Show delayed projects</button>
              <button className={styles.suggestionBtn}>Summarize yesterday</button>
              <button className={styles.suggestionBtn}>Any financial risks?</button>
            </div>
          </div>

          {/* Today's Meetings */}
          <Card 
            title="Today's Schedule & Meetings" 
            description="All times in local time. Hover to view action summaries."
            headerAction={<Button size="sm">View Calendar</Button>}
          >
            <div className={styles.listContainer}>
              <div className={styles.meetingItem}>
                <div className={styles.meetingDetails}>
                  <span className={styles.meetingName}>Q2 Financial Review</span>
                  <div className={styles.meetingMeta}>
                    <span>09:30 - 10:30 (60 mins)</span>
                    <span>•</span>
                    <span>Participants: Vincent (CEO), Sarah (CFO), Dave (VP Finance)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant="blue">Upcoming</Badge>
                  <Button size="sm" variant="secondary" leftIcon={<Play className="w-3.5 h-3.5" />}>Join</Button>
                </div>
              </div>

              <div className={styles.meetingItem}>
                <div className={styles.meetingDetails}>
                  <span className={styles.meetingName}>Project Alpha - Status Alignment</span>
                  <div className={styles.meetingMeta}>
                    <span>11:30 - 12:00 (30 mins)</span>
                    <span>•</span>
                    <span>Participants: Vincent, Alice (PM), Bob (Lead Architect)</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant="orange">Resource Warning</Badge>
                  <Button size="sm" variant="secondary" leftIcon={<Play className="w-3.5 h-3.5" />}>Join</Button>
                </div>
              </div>

              <div className={styles.meetingItem}>
                <div className={styles.meetingDetails}>
                  <span className={styles.meetingName}>Investor Prep & Pitch Review</span>
                  <div className={styles.meetingMeta}>
                    <span>14:00 - 15:30 (90 mins)</span>
                    <span>•</span>
                    <span>Participants: Vincent, Board Members</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Badge variant="gray">Scheduled</Badge>
                  <Button size="sm" variant="secondary" leftIcon={<Play className="w-3.5 h-3.5" />}>Join</Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Pending Approvals */}
          <Card 
            title="Executive Action Items & Pending Approvals" 
            description="Actions requiring your explicit authorization to proceed."
          >
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Value</th>
                  <th>Requester</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>#REQ-094</strong></td>
                  <td>AWS Production Upgrade Scale</td>
                  <td>Cloud Infrastructure</td>
                  <td>$4,800 / mo</td>
                  <td>DevOps Lead</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.actionButton}>Authorize</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#REQ-095</strong></td>
                  <td>Q3 Contractor Onboarding</td>
                  <td>Operations / HR</td>
                  <td>$18,000 / contract</td>
                  <td>Engineering Director</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.actionButton}>Authorize</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#REQ-096</strong></td>
                  <td>Travel & Board Dinner Expense</td>
                  <td>Travel & Entertainment</td>
                  <td>$1,250</td>
                  <td>VP Business Dev</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className={styles.actionButton}>Authorize</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right Column - Stats and Overview */}
        <div className={styles.rightColumn}>
          {/* Key Metrics Dashboard */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Risk Index</span>
              <span className={styles.metricValue} style={{ color: 'var(--accent-orange)' }}>Medium</span>
              <span className={styles.metricSub}>AWS costs & Project Alpha delay</span>
            </div>
            
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Focus Time</span>
              <span className={styles.metricValue} style={{ color: 'var(--accent-green)' }}>3.5 Hrs</span>
              <span className={styles.metricSub}>Estimated available today</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Overdue Tasks</span>
              <span className={styles.metricValue} style={{ color: 'var(--accent-red)' }}>4 Tasks</span>
              <span className={styles.metricSub}>Urgent attention required</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Payments Due</span>
              <span className={styles.metricValue} style={{ color: 'var(--text-primary)' }}>$45.2K</span>
              <span className={styles.metricSub}>Vendor payouts this week</span>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <Card title="Upcoming Deliverables">
            <div className={styles.listContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Q2 Tax Submissions</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Compliance Requirement</span>
                </div>
                <Badge variant="red">July 03</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Alpha QA Verification</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Project Alpha</span>
                </div>
                <Badge variant="orange">July 05</Badge>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Board Progress Deck</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Investor Relations</span>
                </div>
                <Badge variant="blue">July 10</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Executive Actions */}
          <Card title="Recent Activity Logs">
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <span className={styles.activityDot} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.activityText}>Signed off Board Resolution Audit #08</span>
                  <span className={styles.activityTime}>Today, 08:14</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <span className={styles.activityDot} style={{ backgroundColor: 'var(--accent-blue)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.activityText}>Uploaded IRS tax transcripts to Knowledge Base</span>
                  <span className={styles.activityTime}>Yesterday, 17:30</span>
                </div>
              </div>

              <div className={styles.activityItem}>
                <span className={styles.activityDot} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className={styles.activityText}>Approved travel stipend for DevCon team</span>
                  <span className={styles.activityTime}>Yesterday, 15:45</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
