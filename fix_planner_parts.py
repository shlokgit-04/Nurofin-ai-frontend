import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\planner\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''<div className="space-y-1.5 sm:col-span-6">
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
                        </div>'''

replacement = '''<div className="space-y-1.5 sm:col-span-6">
                  <details className="group">
                    <summary className="text-[10px] text-text-secondary font-bold uppercase tracking-wider cursor-pointer list-none flex items-center gap-2 select-none hover:text-text-primary transition-colors">
                      <span className="group-open:rotate-90 transition-transform">▶</span>
                      Participants (Optional)
                    </summary>
                    <div className="w-full bg-background-primary border border-border-subtle rounded-lg p-2 max-h-32 overflow-y-auto space-y-1 mt-2">
                      {teammates.map(user => {
                        const status = availabilityMap[Number(user.id)]?.status;
                        const dot = status === 'busy' ? '🔴' : status === 'partial' ? '🟠' : status === 'free' ? '🟢' : '⚪';
                        return (
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
                            <span className="text-xs text-text-primary font-medium">{dot} {user.full_name}</span>
                          </div>'''

content = content.replace(target, replacement)

# 2. Fix closing tags for 	eammates.map
# The original had ))}  now it needs })}
target_close = '''                      </label>
                    ))}
                    {teammates.length === 0 && <span className="text-xs text-text-muted italic px-1">No teammates found</span>}
                  </div>
                </div>'''

replace_close = '''                      </label>
                      )})}
                      {teammates.length === 0 && <span className="text-xs text-text-muted italic px-1">No teammates found</span>}
                    </div>
                  </details>
                </div>'''

content = content.replace(target_close, replace_close)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
