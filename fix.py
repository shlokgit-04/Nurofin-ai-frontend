import os

filepath = 'app/planner/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Google Events Duplication
old_filter = "const local = localEvents.filter(e => e.date === dateStr);"
new_filter = "const local = localEvents.filter(e => e.date === dateStr && e.source !== 'google_calendar');"
content = content.replace(old_filter, new_filter)

# Fix End Time Input
old_time = '''                <div className="space-y-1.5 sm:col-span-1">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Start Time</label>
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={e => setNewEventStartTime(e.target.value)}
                    className="w-full h-10 bg-background-primary border border-border-subtle rounded-lg px-3 text-sm text-text-primary focus:border-accent-blue transition-all"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>'''
new_time = '''                <div className="space-y-1.5 sm:col-span-1">
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
                  <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Event Type</label>'''

if old_time in content:
    content = content.replace(old_time, new_time)
else:
    # Try with CRLF
    old_time_crlf = old_time.replace('\n', '\r\n')
    new_time_crlf = new_time.replace('\n', '\r\n')
    content = content.replace(old_time_crlf, new_time_crlf)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updates applied.")
