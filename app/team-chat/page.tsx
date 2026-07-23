'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { projectsService } from '@/services/projects';
import { knowledgeService, DocumentItem } from '@/services/knowledge';
import { StreamChat } from 'stream-chat';
import { FileText, X, Paperclip } from 'lucide-react';
import {
  Chat,
  ChannelList,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageComposer,
  Thread,
  LoadingIndicator,
  useChannelStateContext
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/index.css';

// Initialize the Stream client (singleton)
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
const chatClient = apiKey ? StreamChat.getInstance(apiKey) : null;

// --- New Components for Knowledge Hub & Participants ---

const ParticipantSidebar = () => {
  const { channel } = useChannelStateContext();
  const [memberList, setMemberList] = useState<any[]>([]);

  useEffect(() => {
    if (!channel) return;

    const fetchMembers = async () => {
      try {
        const response = await channel.queryMembers({}, { created_at: 1 }, { limit: 100 });
        setMemberList(response.members || []);
      } catch (err) {
        console.error('Failed to query members:', err);
      }
    };

    fetchMembers();

    const handleEvent = () => fetchMembers();
    channel.on('member.added', handleEvent);
    channel.on('member.removed', handleEvent);

    return () => {
      channel.off('member.added', handleEvent);
      channel.off('member.removed', handleEvent);
    };
  }, [channel]);

  if (!channel) return null;

  return (
    <div className="w-64 border-l border-border-subtle bg-background-secondary p-4 flex flex-col overflow-y-auto hidden md:flex">
      <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">
        Participants ({memberList.length})
      </h3>
      <div className="flex flex-col space-y-3">
        {memberList.map((m) => (
          <div key={m.user?.id} className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={m.user?.image || `https://ui-avatars.com/api/?name=${m.user?.name}&background=random`} 
                alt={m.user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              {m.user?.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background-secondary"></div>
              )}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm text-text-primary truncate font-medium">{m.user?.name}</span>
              <span className="text-xs text-text-muted truncate capitalize">{m.user?.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const KnowledgeHubAction = () => {
  const { channel } = useChannelStateContext();
  const [isOpen, setIsOpen] = useState(false);
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      knowledgeService.getDocuments().then(setDocs);
    }
  }, [isOpen]);

  const sendDoc = async (doc: DocumentItem) => {
    if (!channel) return;
    await channel.sendMessage({
      text: `I've shared a document from the Knowledge Hub: **${doc.name}**`,
      attachments: [{
        type: 'file',
        title: doc.name,
        asset_url: '#', // In reality, this would link to the doc
        file_size: parseInt(doc.fileSize) || 0,
        mime_type: 'application/pdf',
      }]
    });
    setIsOpen(false);
  };

  return (
    <>
      <div className="bg-background-primary px-4 py-2 border-t border-border-subtle flex items-center justify-between">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 text-sm text-primary hover:text-primary-hover transition-colors font-medium bg-primary/10 px-3 py-1.5 rounded-lg"
        >
          <Paperclip size={16} />
          <span>Attach Knowledge Hub Doc</span>
        </button>
      </div>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background-secondary w-full max-w-lg rounded-2xl border border-border-subtle shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border-subtle flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary flex items-center">
                <FileText className="mr-2 text-primary" size={20} />
                Knowledge Hub
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {docs.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <FileText className="mx-auto mb-3 text-text-muted opacity-50" size={32} />
                  No documents found in Knowledge Hub.
                </div>
              ) : (
                <div className="space-y-2">
                  {docs.map(d => (
                    <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-border-subtle hover:border-primary/50 hover:bg-background-tertiary transition cursor-pointer group" onClick={() => sendDoc(d)}>
                      <div className="flex flex-col">
                        <span className="text-text-primary font-medium group-hover:text-primary transition">{d.name}</span>
                        <span className="text-xs text-text-muted">{d.category} • {d.fileSize}</span>
                      </div>
                      <button className="text-xs bg-primary text-white px-3 py-1 rounded-md font-medium opacity-0 group-hover:opacity-100 transition">
                        Send
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Page ---

export default function TeamChatPage() {
  const { userProfile, theme } = useStore();
  const [clientReady, setClientReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initChat() {
      if (!chatClient || !userProfile) {
        if (!apiKey) setError('Stream API Key is missing in .env.local');
        return;
      }

      try {
        // 1. Fetch token from backend
        const tokenRes = await fetch('/api/v1/stream/token', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (!tokenRes.ok) throw new Error('Failed to fetch stream token');
        const tokenData = await tokenRes.json();
        const { token, user_id } = tokenData.data;

        // 2. Connect user to Stream
        await chatClient.connectUser(
          {
            id: user_id,
            name: userProfile.full_name,
            image: userProfile.profile_picture || '',
          },
          token
        );

        // 3. Fetch projects to lazily initialize/watch channels
        const projects = await projectsService.getProjects();

        // Watch each project channel and actively push members
        const watchPromises = projects.map(async (p: any) => {
          const members = p.members ? p.members.map((m: any) => String(m.id)) : [];
          if (!members.includes(user_id)) {
            members.push(user_id);
          }
          const channel = chatClient.channel('messaging', `project-${p.id}`, {
            name: p.name || `Project ${p.id}`,
            members: members,
          });
          
          await channel.watch();
          // Force sync members in case the channel was already created without them
          await channel.addMembers(members);
          return channel;
        });

        await Promise.all(watchPromises);
        
        setClientReady(true);
      } catch (err: any) {
        console.error('Failed to initialize Stream Chat:', err);
        setError(err.message || 'Failed to initialize chat');
      }
    }

    if (chatClient && !chatClient.userID) {
      initChat();
    } else if (chatClient?.userID) {
      setClientReady(true);
    }

    return () => {};
  }, [userProfile]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-red-500/10 text-red-500 p-6 rounded-xl border border-red-500/20 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Chat Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!clientReady || !chatClient) {
    return (
      <div className="flex items-center justify-center h-full text-text-primary">
        <LoadingIndicator />
        <span className="ml-3 text-text-muted">Connecting to Global Chat...</span>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background-primary overflow-hidden stream-theme-wrapper">
      <Chat client={chatClient} theme={`str-chat__theme-${theme}`}>
        <div className="w-80 border-r border-border-subtle bg-background-secondary flex-shrink-0">
          <ChannelList 
            filters={{ type: 'messaging', members: { $in: [String(userProfile?.id)] } }}
            sort={{ last_message_at: -1 }}
            options={{ state: true, watch: true, presence: true }}
          />
        </div>
        <div className="flex-1 min-w-0 bg-background-primary relative">
          <Channel>
            <div className="flex h-full w-full">
              <div className="flex-1 flex flex-col min-w-0">
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <KnowledgeHubAction />
                  <MessageComposer />
                </Window>
              </div>
              <ParticipantSidebar />
            </div>
            <Thread />
          </Channel>
        </div>
      </Chat>
    </div>
  );
}
