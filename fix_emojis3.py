import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def repl(match):
    return '<option key={u.id} value={u.id}>{availabilityMap[Number(u.id)] ? (availabilityMap[Number(u.id)].status === "busy" ? "\U0001F534 " : availabilityMap[Number(u.id)].status === "partial" ? "\U0001F7E0 " : "\U0001F7E2 ") : ""}{u.name}</option>'

content = re.sub(r'<option key=\{u\.id\} value=\{u\.id\}>.*?\{u\.name\}</option>', repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
