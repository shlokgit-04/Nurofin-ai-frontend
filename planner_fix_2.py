import os
path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
state_target = """  const [newEventOpen, setNewEventOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{message: string, alternative_times: any[]} | null>(null);"""
state_repl = """  const [newEventParticipants, setNewEventParticipants] = useState<number[]>([]);
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [conflictData, setConflictData] = useState<{message: string, alternative_times: any[]} | null>(null);

  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);"""
content = content.replace(state_target, state_repl)

# 2. Add event request changes
req_target = """      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        end_time: newEventEndTime,
        type: newEventType,
      });"""
req_repl = """      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        end_time: newEventEndTime,
        type: newEventType,
        participants: newEventParticipants.map(String),
      });"""
content = content.replace(req_target, req_repl)

reset_target = """      setNewEventTitle('');
      setNewEventOpen(false);"""
reset_repl = """      setNewEventTitle('');
      setNewEventParticipants([]);
      setNewEventOpen(false);"""
content = content.replace(reset_target, reset_repl)

# 3. Add Event Form UI Changes
form_target = """            <div className="flex gap-2 justify-end h-10 items-center sm:col-span-5 mt-2 border-t border-border-subtle pt-4">"""
form_repl = """            <div className="space-y-1.5 sm:col-span-5">
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Participants (Optional)</label>
              <div className="flex flex-wrap gap-2">
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
              </div>
            </div>
            <div className="flex gap-2 justify-end h-10 items-center sm:col-span-5 mt-2 border-t border-border-subtle pt-4">"""
content = content.replace(form_target, form_repl)

# 4. Tasks Tab Changes
task_tab_target = """          {/* Tasks Tab View */}
          <TabsContent value="tasks" className="mt-0">
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6">
              <h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-accent-purple" /> Assigned Tasks
              </h3>
              
              {tasksLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full"></div>
                </div>
              ) : tasks.length > 0 ? ("""
task_tab_repl = """          {/* Tasks Tab View */}
          <TabsContent value="tasks" className="mt-0">
            <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-accent-purple" /> Assigned Tasks
                </h3>
                <div className="flex items-center gap-1 bg-background-secondary p-1 rounded-lg">
                   <button onClick={() => setShowCompletedTasks(false)} className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${!showCompletedTasks ? 'bg-accent-purple text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Active</button>
                   <button onClick={() => setShowCompletedTasks(true)} className={`text-xs px-3 py-1.5 rounded-md font-bold transition-all ${showCompletedTasks ? 'bg-accent-purple text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}>Completed</button>
                </div>
              </div>
              
              {tasksLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full"></div>
                </div>
              ) : tasks.filter(t => showCompletedTasks ? t.status === 'completed' : t.status !== 'completed').length > 0 ? ("""
content = content.replace(task_tab_target, task_tab_repl)

task_map_target = """                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {tasks.map(task => (
                    <motion.div 
                      key={task.id} 
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full"
                    >"""
task_map_repl = """                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                >
                  {tasks.filter(t => showCompletedTasks ? t.status === 'completed' : t.status !== 'completed').map(task => (
                    <motion.div 
                      key={task.id} 
                      variants={itemVariants}
                      whileHover={{ y: -4 }}
                      className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full cursor-pointer"
                      onClick={() => {
                          setSelectedTaskDetails(task);
                          setTaskDetailsOpen(true);
                      }}
                    >"""
content = content.replace(task_map_target, task_map_repl)

schedule_btn_target = """                          {isOwnSchedule && (
                            <button 
                              onClick={() => {
                                setSelectedTaskId(task.id);
                                setTaskScheduleDate(new Date().toISOString().split('T')[0]);
                                setScheduleTaskOpen(true);
                              }}
                              className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 hover:bg-accent-purple/20 px-2 py-1 rounded transition-colors"
                            >
                              {task.scheduledDate ? 'Reschedule' : 'Schedule Time'}
                            </button>
                          )}"""
schedule_btn_repl = """                          {isOwnSchedule && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskId(task.id);
                                setTaskScheduleDate(new Date().toISOString().split('T')[0]);
                                setScheduleTaskOpen(true);
                              }}
                              className="text-[10px] font-bold text-accent-purple bg-accent-purple/10 hover:bg-accent-purple/20 px-2 py-1 rounded transition-colors"
                            >
                              {task.scheduledDate ? 'Reschedule' : 'Schedule Time'}
                            </button>
                          )}"""
content = content.replace(schedule_btn_target, schedule_btn_repl)

# 5. Add Modal at bottom
modal_target = """      {/* Schedule Task Modal */}"""
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
content = content.replace(modal_target, modal_repl)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
