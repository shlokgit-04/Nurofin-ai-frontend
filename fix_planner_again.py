import os

path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. State changes
state_target = """  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventParticipantIds, setNewEventParticipantIds] = useState<number[]>([]);
  const [conflictData, setConflictData] = useState<{message: string, alternative_times: any[]} | null>(null);"""
state_repl = """  const [newEventStartTime, setNewEventStartTime] = useState('10:00');
  const [newEventEndTime, setNewEventEndTime] = useState('11:00');
  const [showParticipants, setShowParticipants] = useState(false);
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);
  const [newEventType, setNewEventType] = useState('meeting');
  const [newEventParticipants, setNewEventParticipants] = useState<number[]>([]);
  const [conflictData, setConflictData] = useState<{message: string, alternative_times: any[]} | null>(null);"""
content = content.replace(state_target, state_repl)

# 2. handleAddEvent logic (add tasks + end_time)
add_event_target = """  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      setConflictData(null);
      const newEvent = await meetingsService.createMeeting({
        title: newEventTitle,
        date: newEventDate,
        time: newEventStartTime,
        type: newEventType,
        participant_ids: newEventParticipantIds
      });
      setLocalEvents([...localEvents, newEvent]);
      setNewEventTitle('');
      setNewEventOpen(false);
      loadSchedule();
    } catch (error: any) {"""
add_event_repl = """  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    try {
      setConflictData(null);
      if (newEventType === 'task') {
        await tasksService.createTask({
          title: newEventTitle,
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: newEventDate,
          assigneeId: selectedUserId.toString()
        } as any);
        loadTasks();
      } else {
        const newEvent = await meetingsService.createMeeting({
          title: newEventTitle,
          date: newEventDate,
          time: newEventStartTime,
          end_time: newEventEndTime,
          type: newEventType,
          participants: newEventParticipants.map(String)
        });
        setLocalEvents([...localEvents, newEvent]);
      }
      setNewEventTitle('');
      setNewEventParticipants([]);
      setNewEventOpen(false);
      loadSchedule();
    } catch (error: any) {"""
content = content.replace(add_event_target, add_event_repl)

# 3. Add End Time field
end_time_target = """              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={newEventStartTime}
                  onChange={e => setNewEventStartTime(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>"""
end_time_repl = """              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={newEventStartTime}
                  onChange={e => setNewEventStartTime(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={newEventEndTime}
                  onChange={e => setNewEventEndTime(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>"""
content = content.replace(end_time_target, end_time_repl)

# 4. Add "Task" to Event Type options and Replace the old Participants checkboxes entirely
participants_target = """              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                >
                  <option value="meeting">Meeting</option>
                  <option value="reminder">Reminder</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-6">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Participants</label>
                <div className="w-full bg-background-primary border border-border-subtle rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                  {teammates.map(user => (
                    <label key={user.id} className="flex flex-col gap-1 cursor-pointer hover:bg-surface-hover p-1.5 rounded transition-colors">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-border-subtle text-accent-blue focus:ring-accent-blue"
                          checked={newEventParticipantIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewEventParticipantIds([...newEventParticipantIds, user.id]);
                            } else {
                              setNewEventParticipantIds(newEventParticipantIds.filter(id => id !== user.id));
                            }
                          }}
                        />
                        <span className="text-xs text-text-primary font-medium">{user.full_name}</span>
                      </div>
                      {availabilityWarnings[user.id] && (
                        <span className="text-[10px] text-accent-red font-semibold ml-6">
                          ?? {availabilityWarnings[user.id]}
                        </span>
                      )}
                    </label>
                  ))}
                  {teammates.length === 0 && <span className="text-xs text-text-muted italic px-1">No teammates found</span>}
                </div>
              </div>"""
participants_repl = """              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>
                <select
                  value={newEventType}
                  onChange={e => setNewEventType(e.target.value)}
                  className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                >
                  <option value="meeting">Meeting</option>
                  <option value="reminder">Reminder</option>
                  <option value="event">Event</option>
                  <option value="task">Task</option>
                </select>
              </div>
              <div className="space-y-1.5 sm:col-span-6">
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
              </div>"""
content = content.replace(participants_target, participants_repl)


# 5. Fix Tasks view (Make tasks clickable, add Completed tasks section)
tasks_target = """                  {tasksLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full"></div>
                    </div>
                  ) : tasks.length > 0 ? (
                    <motion.div 
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
tasks_repl = """                  {tasksLoading ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="animate-spin w-8 h-8 border-4 border-accent-purple border-t-transparent rounded-full"></div>
                    </div>
                  ) : tasks.length > 0 ? (
                    <>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                    >
                      {tasks.filter(t => t.status !== 'completed').map(task => (
                        <motion.div 
                          key={task.id} 
                          variants={itemVariants}
                          whileHover={{ y: -4 }}
                          onClick={() => {
                            setSelectedTaskDetails(task);
                            setTaskDetailsOpen(true);
                          }}
                          className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full cursor-pointer"
                        >"""
content = content.replace(tasks_target, tasks_repl)

tasks_end_target = """                      ))}
                    </motion.div>
                  ) : ("""
tasks_end_repl = """                      ))}
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
                          {tasks.filter(t => t.status === 'completed').map(task => (
                            <motion.div 
                              key={task.id} 
                              variants={itemVariants}
                              whileHover={{ y: -4 }}
                              onClick={() => {
                                setSelectedTaskDetails(task);
                                setTaskDetailsOpen(true);
                              }}
                              className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm border bg-accent-green/10 text-accent-green border-accent-green/20">
                                  {task.status.replace('_', ' ')}
                                </span>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                  task.priority === 'high' ? 'text-accent-red border-accent-red/30 bg-accent-red/5' :
                                  task.priority === 'medium' ? 'text-accent-orange border-accent-orange/30 bg-accent-orange/5' :
                                  'text-text-muted border-border-subtle bg-background-secondary'
                                }`}>
                                  {task.priority} Priority
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-text-primary mb-2 line-clamp-2">{task.title}</h4>
                              <p className="text-[10px] text-text-secondary line-clamp-2 mb-4 flex-1">{task.description}</p>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    </>
                  ) : ("""
content = content.replace(tasks_end_target, tasks_end_repl)

# Prevent bubbling on Schedule Task button
sched_target = """                          {isOwnSchedule && (
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
sched_repl = """                          {isOwnSchedule && (
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
content = content.replace(sched_target, sched_repl)

# 6. Finally, inject TaskModal at the bottom (if not already there)
# We know the page exports PlannerPage. We will look for <AnimatePresence> modal block near the end.
# If I inject TaskModal inside <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full pb-20"> it should work.

modal = """
      <TaskModal 
        isOpen={taskDetailsOpen}
        onClose={() => {
          setTaskDetailsOpen(false);
          setSelectedTaskDetails(null);
        }}
        task={selectedTaskDetails}
        teammates={teammates}
      />"""

if "<TaskModal " not in content:
    content = content.replace("    </div>\n  );\n}", modal + "\n    </div>\n  );\n}")


with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
