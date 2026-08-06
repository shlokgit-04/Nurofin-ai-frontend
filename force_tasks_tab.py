import os

path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                  {tasksLoading ? (
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
repl = """                  {tasksLoading ? (
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
content = content.replace(target, repl)

target2 = """                          {isOwnSchedule && (
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
repl2 = """                          {isOwnSchedule && (
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
content = content.replace(target2, repl2)

target3 = """                      ))}
                    </motion.div>
                  ) : ("""
repl3 = """                      ))}
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
                              
                              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border-subtle/50">
                                <div className="flex items-center gap-1.5 text-text-muted">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-[10px] font-medium">
                                    {task.dueDate ? `Due ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                    </>
                  ) : ("""
content = content.replace(target3, repl3)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
