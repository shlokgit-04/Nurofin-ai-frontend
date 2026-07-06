'use client';

import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Image as ImageIcon, 
  FileSpreadsheet, 
  Search, 
  Upload, 
  ChevronRight, 
  BookOpen, 
  Plus, 
  Download, 
  FileUp, 
  Info 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface DocItem {
  id: string;
  title: string;
  category: 'Legal' | 'Finance' | 'AI' | 'Engineering';
  type: 'pdf' | 'docx' | 'xlsx' | 'png';
  size: string;
  updatedAt: string;
  description: string;
  contentSnippet: string;
}

const mockDocs: DocItem[] = [
  { id: 'doc-1', title: 'Q2 Compliance Audits Certification.pdf', category: 'Finance', type: 'pdf', size: '2.4 MB', updatedAt: '2026-07-01', description: 'Certified operations ledger sheets from Q2.', contentSnippet: 'This document certifies that Nurofin transaction speeds and ledgers conform to standard auditing procedures. Signed Vincent N.' },
  { id: 'doc-2', title: 'GetStream API Tokens Protocol.docx', category: 'AI', type: 'docx', size: '1.1 MB', updatedAt: '2026-07-04', description: 'Instructions on establishing CORS secure headers.', contentSnippet: 'Establishing chat tokens requires signing user payloads with the developer application private key. Ensure CORS rules allow localhost and static origins.' },
  { id: 'doc-3', title: 'AWS Cluster Cost Sheet Q3.xlsx', category: 'Finance', type: 'xlsx', size: '5.8 MB', updatedAt: '2026-06-28', description: 'Cost projections for database sharding operations.', contentSnippet: 'Database instances consume $80,000 monthly. License costs stand at $35,000, while support requires $20,000. Held reserve is $15,000.' },
  { id: 'doc-4', title: 'Obsidian Theme Layout Design.png', category: 'Engineering', type: 'png', size: '820 KB', updatedAt: '2026-07-05', description: 'Design tokens mockup illustration.', contentSnippet: 'Hex codes: Primary background #0B1220, secondary surface #121A2A, card container #1A2332. All fonts are Outfit/Inter.' },
];

export default function KnowledgeHubPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>(mockDocs);

  // Folder categories
  const categories = ['All', 'Finance', 'AI', 'Engineering', 'Legal'];

  // Handle document upload
  const handleUpload = () => {
    const newDoc: DocItem = {
      id: `doc-${Date.now()}`,
      title: 'Uploaded Document.pdf',
      category: 'Legal',
      type: 'pdf',
      size: '1.5 MB',
      updatedAt: new Date().toISOString().split('T')[0],
      description: 'Newly uploaded document.',
      contentSnippet: 'This is a mock uploaded document record.',
    };
    setDocs([newDoc, ...docs]);
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-accent-red" />;
      case 'xlsx': return <FileSpreadsheet className="w-5 h-5 text-accent-green" />;
      case 'png': return <ImageIcon className="w-5 h-5 text-accent-blue" />;
      default: return <FileText className="w-5 h-5 text-accent-orange" />;
    }
  };

  // Filtered docs list
  const filteredDocs = docs.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchFilter.toLowerCase()) || 
                          doc.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenDoc = (doc: DocItem) => {
    setSelectedDoc(doc);
    setViewerOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto font-sans text-text-primary">
      
      {/* Left Column: Folders Directory Tree */}
      <div className="bg-background-secondary rounded-lg border border-border-subtle p-4 h-fit shadow-md">
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4 text-text-muted" /> Folder Directories
        </h3>
        <div className="space-y-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded transition-colors text-left",
                  isSelected 
                    ? "bg-accent-blue/10 text-accent-blue" 
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                )}
              >
                <div className="flex items-center gap-2">
                  <Folder className={cn("w-4 h-4", isSelected ? "text-accent-blue" : "text-text-muted")} />
                  <span>{cat}</span>
                </div>
                <ChevronRight className="w-3 h-3 text-text-muted" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Search bar, file upload and document catalog grids */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Top actions toolbar */}
        <div className="bg-background-secondary p-4 rounded-lg border border-border-subtle flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative w-full sm:max-w-xs flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-text-muted" />
            <Input
              type="text"
              placeholder="Search document names, descriptions..."
              className="pl-9 text-xs"
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
            />
          </div>

          <button
            onClick={handleUpload}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-accent-blue hover:bg-accent-blue-hover text-white text-xs font-semibold rounded shadow transition-colors"
          >
            <Upload className="w-4 h-4" /> Upload Document
          </button>
        </div>

        {/* Document Grid catalog */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => handleOpenDoc(doc)}
              className="bg-background-secondary border border-border-subtle rounded-lg p-4 flex gap-4 hover:border-text-muted cursor-pointer transition-all shadow-md group relative"
            >
              <div className="p-3 bg-background-primary border border-border-subtle/50 rounded-lg h-fit flex-shrink-0">
                {getDocIcon(doc.type)}
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <h4 className="text-xs font-bold text-text-primary truncate pr-4 group-hover:text-accent-blue transition-colors">
                  {doc.title}
                </h4>
                <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-text-muted pt-1 border-t border-border-subtle/30">
                  <span>Size: {doc.size}</span>
                  <span>{doc.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-2 bg-background-secondary p-12 text-center border border-border-subtle rounded text-text-muted">
              No matching documents found in this directory.
            </div>
          )}
        </div>

      </div>

      {/* Document Viewer Modal Overlay */}
      {selectedDoc && (
        <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-blue" />
                {selectedDoc.title}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 pt-1">
                <span className="text-2xs bg-surface-card px-2 py-0.5 rounded border border-border-subtle font-semibold uppercase">
                  {selectedDoc.type} File
                </span>
                <span className="text-2xs text-text-muted">
                  Directory: {selectedDoc.category} • Size: {selectedDoc.size}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3 font-sans text-xs">
              <div className="space-y-1.5">
                <span className="text-2xs text-text-secondary font-bold uppercase tracking-wider block">Description Summary</span>
                <p className="text-text-primary leading-relaxed bg-background-primary p-3.5 rounded border border-border-subtle/50">
                  {selectedDoc.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-2xs text-text-secondary font-bold uppercase tracking-wider block">Document Text Snippet (Preview)</span>
                <div className="bg-background-primary p-4 rounded border border-border-subtle/50 font-mono text-[11px] text-text-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedDoc.contentSnippet}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-2">
              <button
                onClick={() => setViewerOpen(false)}
                className="px-4 py-1.5 border border-border-subtle text-text-secondary hover:text-text-primary text-2xs font-semibold rounded"
              >
                Close Viewer
              </button>
              <button
                onClick={() => {
                  alert('Initiating document download...');
                  setViewerOpen(false);
                }}
                className="px-4 py-1.5 bg-accent-blue hover:bg-accent-blue-hover text-white text-2xs font-semibold rounded shadow transition-all flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
