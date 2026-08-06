import os

filepath = 'app/planner/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add showTeamView state and teamBusyBlocks state
state_old = "const [searchQuery, setSearchQuery] = useState('');"
state_new = """const [searchQuery, setSearchQuery] = useState('');
  const [showTeamView, setShowTeamView] = useState(false);
  const [teamBusyBlocks, setTeamBusyBlocks] = useState<any[]>([]);"""
if state_old in content and "showTeamView" not in content:
    content = content.replace(state_old, state_new)

# 2. Add useEffect to fetch team busy blocks if showTeamView is true
effect_old = "const filteredTeammates = teammates.filter(t => t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));"
effect_new = """const filteredTeammates = teammates.filter(t => t.full_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (showTeamView && isAdmin) {
      const loadTeamBlocks = async () => {
        try {
          const userIds = teammates.map(t => t.id);
          if (userIds.length > 0) {
            const blocks = await plannerService.checkAvailability(userIds, todayStr);
            setTeamBusyBlocks(blocks);
          }
        } catch (e) {
          console.error('Failed to load team blocks', e);
        }
      };
      loadTeamBlocks();
    }
  }, [showTeamView, isAdmin, teammates, todayStr]);"""
if effect_old in content and "loadTeamBlocks" not in content:
    content = content.replace(effect_old, effect_new)

# 3. Add the toggle button in the Daily Timeline header
header_old = """<h3 className="text-sm font-bold border-b border-border-subtle pb-4 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-accent-blue" /> Daily Timeline
                  </h3>"""
header_new = """<div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-accent-blue" /> Daily Timeline
                    </h3>
                    {isAdmin && (
                      <button 
                        onClick={() => setShowTeamView(!showTeamView)}
                        className={px-3 py-1.5 text-xs font-bold rounded-lg transition-all }
                      >
                        {showTeamView ? 'View Single Schedule' : 'View Team Schedule'}
                      </button>
                    )}
                  </div>"""
if header_old in content and "View Team Schedule" not in content:
    content = content.replace(header_old, header_new)

# 4. Insert Team Timeline rendering logic
team_render_old = """{(() => {
                    const todaysEvents = getEventsForDate(todayStr);"""
team_render_new = """{(() => {
                    if (showTeamView) {
                      const hours = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM to 8 PM
                      return (
                        <div className="space-y-4 overflow-x-auto pb-4">
                          <div className="min-w-[800px]">
                            <div className="grid grid-cols-[150px_1fr] gap-4">
                              <div className="font-bold text-xs text-text-secondary pt-2">Team Member</div>
                              <div className="grid grid-cols-14 gap-1 relative">
                                {hours.map(h => (
                                  <div key={h} className="text-[10px] text-text-muted text-center border-l border-border-subtle h-full">
                                    {h}:00
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mt-4 space-y-3">
                              {teammates.map(user => {
                                const userBlocks = teamBusyBlocks.filter(b => b.user_id === user.id);
                                return (
                                  <div key={user.id} className="grid grid-cols-[150px_1fr] gap-4 items-center group">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center text-[10px] font-bold text-accent-blue flex-shrink-0">
                                        {user.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </div>
                                      <p className="text-xs font-semibold text-text-primary truncate" title={user.full_name}>{user.full_name}</p>
                                    </div>
                                    <div className="grid grid-cols-14 gap-1 relative h-10 bg-background-secondary/30 rounded-lg border border-border-subtle overflow-hidden">
                                      {/* Grid lines */}
                                      {hours.map((h, i) => (
                                        <div key={h} className="border-l border-border-subtle/50 h-full absolute" style={{ left: ${(i / 14) * 100}% }}></div>
                                      ))}
                                      
                                      {/* Busy blocks */}
                                      {userBlocks.map((b, idx) => {
                                        let startH = 0, startM = 0, endH = 0, endM = 0;
                                        if (b.start_time && b.end_time) {
                                          [startH, startM] = b.start_time.split(':').map(Number);
                                          [endH, endM] = b.end_time.split(':').map(Number);
                                        } else if (b.start && b.end) {
                                          const s = new Date(b.start);
                                          const e = new Date(b.end);
                                          startH = s.getHours(); startM = s.getMinutes();
                                          endH = e.getHours(); endM = e.getMinutes();
                                        }
                                        
                                        // Bound to 7 AM - 8 PM (20:00)
                                        if (startH >= 21 || endH < 7) return null;
                                        startH = Math.max(7, startH);
                                        endH = Math.min(21, endH);
                                        
                                        const startPercent = ((startH - 7) * 60 + startM) / (14 * 60) * 100;
                                        const durationMins = ((endH - startH) * 60) + (endM - startM);
                                        const widthPercent = (durationMins / (14 * 60)) * 100;
                                        
                                        // Different colors for different users
                                        const colors = ['bg-accent-blue', 'bg-accent-purple', 'bg-accent-green', 'bg-amber-500', 'bg-rose-500'];
                                        const color = colors[user.id % colors.length];
                                        
                                        return (
                                          <div 
                                            key={idx}
                                            className={bsolute top-1.5 bottom-1.5  rounded shadow-sm opacity-90 hover:opacity-100 transition-opacity cursor-pointer group/block}
                                            style={{ left: ${Math.max(0, startPercent)}%, width: ${Math.min(100 - startPercent, widthPercent)}%, minWidth: '4px' }}
                                          >
                                            <div className="hidden group-hover/block:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-50">
                                              {b.title}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    const todaysEvents = getEventsForDate(todayStr);"""

if team_render_old in content and "showTeamView" not in content.split("(() => {")[1]:
    content = content.replace(team_render_old, team_render_new)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Team Timeline added.")
