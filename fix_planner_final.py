import os
import re

path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
if "newEventEndTime" not in content:
    content = content.replace("const [newEventStartTime, setNewEventStartTime] = useState('10:00');", "const [newEventStartTime, setNewEventStartTime] = useState('10:00');\n  const [newEventEndTime, setNewEventEndTime] = useState('11:00');\n  const [showParticipants, setShowParticipants] = useState(false);\n  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);\n  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);")

if "ChevronDown" not in content:
    content = content.replace("ChevronRight,", "ChevronRight,\n  ChevronDown,\n  ChevronUp,")

# 2. Add event request changes
req_repl = """      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        end_time: newEventEndTime,
        type: newEventType,
        participants: newEventParticipants.map(String),
      });"""
content = re.sub(r'const newEvent = await meetingsService\.createMeeting\(\{\s*title: newEventTitle,\s*date: newEventDate,\s*time: newEventStartTime,\s*type: newEventType,\s*participant_ids: newEventParticipantIds\s*\}\);', req_repl, content)

content = content.replace("setNewEventTitle('');\n      setNewEventOpen(false);", "setNewEventTitle('');\n      setNewEventParticipants([]);\n      setNewEventOpen(false);")

# 3. Add Event Form UI Changes
form_target = r'<div className="space-y-1\.5 sm:col-span-1">\s*<label className="text-\[10px\] text-text-secondary font-bold uppercase tracking-wider">Start Time</label>[\s\S]*?</div>'

if "newEventEndTime" not in re.search(form_target, content).group(0):
    match = re.search(form_target, content)
    if match:
        end_time_ui = """              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={newEventEndTime}
                  onChange={e => setNewEventEndTime(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>"""
        content = content[:match.end()] + "\n" + end_time_ui + content[match.end():]

part_target = r'<div className="flex gap-2 justify-end h-10 items-center sm:col-span-6 mt-2 border-t border-border-subtle pt-4">'
part_repl = """              <div className="space-y-1.5 sm:col-span-6">
                <button type="button" onClick={() => setShowParticipants(!showParticipants)} className="flex items-center gap-2 text-[10px] text-text-secondary font-bold uppercase tracking-wider hover:text-text-primary transition-colors">
                  Participants (Optional)
                  {showParticipants ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {showParticipants && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="flex flex-wrap gap-2 overflow-hidden pt-2">
                        {teammates.filter(tm => tm.id !== currentUserId).map(tm => {
                           const isSelected = newEventParticipants.includes(tm.id);
                           return (
                              <button
                                key={tm.id}
                                type="button"
                                onClick={() => {
                                   if (isSelected) {
                                      setNewEventParticipants(newEventParticipants.filter(id => id !== tm.id));
                                   } else {
                                      setNewEventParticipants([...newEventParticipants, tm.id]);
                                   }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-accent-blue text-white' : 'bg-background-secondary text-text-secondary hover:bg-surface-hover border border-border-subtle'}`}
                              >
                                 {tm.email}
                              </button>
                           )
                        })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex gap-2 justify-end h-10 items-center sm:col-span-6 mt-2 border-t border-border-subtle pt-4">"""
if "Participants (Optional)" not in content:
    content = content.replace(part_target, part_repl)

# 4. Tasks Tab Changes (Active & Completed division)
task_tab_target = r'(\{\s*tasks\.map\(task => \()([\s\S]*?)(\s*\}\)\s*\})'
def task_repl(m):
    item_tpl = m.group(2)
    item_tpl_clickable = re.sub(r'(<motion\.div\s+key=\{task\.id\}\s+variants=\{itemVariants\}\s+whileHover=\{\{\s*y:\s*-4\s*\}\}\s+className=")([^"]+)"', r'\1\2 cursor-pointer"\nonClick={() => { setSelectedTaskDetails(task); setTaskDetailsOpen(true); }}', item_tpl)
    item_tpl_clickable = re.sub(r'(onClick=\{)([^}]+)(\}\s+className="[^"]*Schedule Time[^"]*")', r'\1(e) => { e.stopPropagation(); \2\3', item_tpl_clickable)

    new_content = """                      {tasks.filter(t => t.status !== 'completed').map(task => (""" + item_tpl_clickable + """
                      ))}
                    </motion.div>
                    
                    {tasks.filter(t => t.status === 'completed').length > 0 && (
                      <div className="mt-8 pt-6 border-t border-border-subtle">
                        <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-text-secondary">
                          <CheckCircle2 className="w-4 h-4 text-accent-green" /> Completed Tasks
                        </h3>
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="show"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70 hover:opacity-100 transition-opacity"
                        >
                          {tasks.filter(t => t.status === 'completed').map(task => (""" + item_tpl_clickable + """
                          ))}
                        </motion.div>
                      </div>
                    )}"""
    return new_content

if "Completed Tasks" not in content:
    content = re.sub(task_tab_target, task_repl, content)

# 5. Add Modal at bottom
modal_repl = """      {/* Task Details Modal */}
      <AnimatePresence>
        {taskDetailsOpen && selectedTaskDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setTaskDetailsOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl w-full max-w-md flex flex-col gap-4"
            >
              <div className="flex justify-between items-start border-b border-border-subtle pb-3">
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent-purple" /> {selectedTaskDetails.title}
                </h3>
                <button onClick={() => setTaskDetailsOpen(false)} className="text-text-muted hover:text-text-primary">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4 py-2">
                <p className="text-sm text-text-secondary">{selectedTaskDetails.description || 'No description provided.'}</p>
                
                <div className="grid grid-cols-2 gap-4 bg-background-primary p-4 rounded-lg border border-border-subtle">
                   <div>
                     <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Status</p>
                     <p className="text-xs font-semibold capitalize">{selectedTaskDetails.status}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Priority</p>
                     <p className="text-xs font-semibold capitalize">{selectedTaskDetails.priority}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Assigned By</p>
                     <p className="text-xs font-semibold">{selectedTaskDetails.assigned_by?.full_name || selectedTaskDetails.assigned_by_name || 'System'}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold text-text-muted mb-1">Date Created</p>
                     <p className="text-xs font-semibold">{selectedTaskDetails.created_at ? new Date(selectedTaskDetails.created_at).toLocaleDateString() : 'N/A'}</p>
                   </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setTaskDetailsOpen(false)} className="px-4 py-2 bg-background-secondary text-text-primary hover:bg-surface-hover rounded-lg font-bold text-xs transition-all">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Task Modal */}"""
if "Task Details Modal" not in content:
    content = content.replace("      {/* Schedule Task Modal */}", modal_repl)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
