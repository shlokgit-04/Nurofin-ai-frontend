'use client';

import React, { useState } from 'react';
import { Send, Upload, Mic, BrainCircuit, Sparkles, User } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import styles from './chat.module.css';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello Vincent. I have reviewed yesterday\'s operations, financial balances, and current project timelines. How can I assist you today?',
    }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', content: input },
      { role: 'assistant', content: `I have analyzed your query: "${input}". Let me gather the files and records from the Knowledge Base and Finance Modules to compile an executive answer.` }
    ]);
    setInput('');
  };

  const handleSuggestion = (text: string) => {
    setMessages(prev => [
      ...prev,
      { role: 'user', content: text },
      { role: 'assistant', content: `Processing request for: "${text}". Querying active system logs...` }
    ]);
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit className="w-6 h-6" style={{ color: 'var(--accent-blue)' }} />
          <h1>Executive AI Assistant</h1>
        </div>
        <p>Enterprise intelligence and operations query engine.</p>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.chatArea}>
          <div className={styles.messageLog}>
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`${styles.messageWrapper} ${m.role === 'user' ? styles.userMsg : styles.aiMsg}`}
              >
                <div className={styles.avatar}>
                  {m.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />}
                </div>
                <div className={styles.messageBubble}>
                  <p>{m.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.suggestionGrid}>
            <button onClick={() => handleSuggestion('What should I focus on today?')} className={styles.sugBtn}>What should I focus on today?</button>
            <button onClick={() => handleSuggestion('Show delayed projects')} className={styles.sugBtn}>Show delayed projects</button>
            <button onClick={() => handleSuggestion('Summarize yesterday\'s meetings')} className={styles.sugBtn}>Summarize yesterday</button>
            <button onClick={() => handleSuggestion('Are there any financial risks?')} className={styles.sugBtn}>Any financial risks?</button>
          </div>

          <div className={styles.inputBar}>
            <button className={styles.actionIconButton} title="Upload Documents">
              <Upload className="w-5 h-5" />
            </button>
            <button className={styles.actionIconButton} title="Voice Query">
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              placeholder="Ask Executive AI anything..."
              className={styles.textInput}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button variant="primary" size="sm" onClick={handleSend} leftIcon={<Send className="w-4 h-4" />}>
              Send
            </Button>
          </div>
        </div>

        <div className={styles.sideInfo}>
          <Card title="Query Scope" description="Active integrations & context sources">
            <div className={styles.scopeList}>
              <div className={styles.scopeItem}>
                <span className={styles.scopeDot} />
                <span>Nurofin General Ledger (Finance)</span>
              </div>
              <div className={styles.scopeItem}>
                <span className={styles.scopeDot} />
                <span>Jira & GitHub (Project Alpha)</span>
              </div>
              <div className={styles.scopeItem}>
                <span className={styles.scopeDot} />
                <span>Google Calendar & Meet Logs</span>
              </div>
              <div className={styles.scopeItem}>
                <span className={styles.scopeDot} />
                <span>Executive Knowledge Base (PDF, DOCX)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
