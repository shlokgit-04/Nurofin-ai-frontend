import os
import re

path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove the old checkboxes Participants section
old_participants = r'<div className="space-y-1\.5 sm:col-span-6">\s*<label className="text-\[10px\] text-text-secondary font-bold uppercase tracking-wider">Participants</label>\s*<div className="w-full bg-background-primary border border-border-subtle rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">[\s\S]*?</div>\s*</div>'
content = re.sub(old_participants, '', content)

# 2. Fix the duplicated "Participants (Optional)" block in the Add Task form
# The Add Task Form ends with a submit button right after a duplicated participants block.
# Let's find the second instance of "Participants (Optional)" and remove it.
parts = content.split('Participants (Optional)')
if len(parts) > 2:
    # It appears twice. The second one is near 'Due Date'. Let's use regex to surgically remove it.
    bad_part = r'<div className="space-y-1\.5 sm:col-span-6">\s*<button type="button" onClick=\{[^}]*setShowParticipants[^}]*\}[\s\S]*?</AnimatePresence>\s*</div>\s*(<div className="flex gap-2 justify-end h-10 items-center sm:col-span-6 mt-2 border-t border-border-subtle pt-4">\s*<button\s*type="button"\s*onClick=\{[^}]*setNewTaskOpen\(false\)[^}]*\})'
    content = re.sub(bad_part, r'\1', content)

# 3. Check Task Details onClick
# Let's see if the div has the correct onClick.
task_div_pattern = r'(<motion\.div\s*key=\{task\.id\}\s*variants=\{itemVariants\}\s*whileHover=\{\{\s*y:\s*-4\s*\}\}\s*className="bg-background-primary border border-border-subtle rounded-xl p-5 shadow-sm hover:border-accent-purple/50 transition-all group flex flex-col h-full cursor-pointer"\s*onClick=\{[^\}]*\})'
# Let's just make sure it's opening the modal. We'll leave this alone if it's there.

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
