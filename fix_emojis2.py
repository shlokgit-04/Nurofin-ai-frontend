import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

def repl(match):
    return '{availabilityMap[Number(u.id)] ? (availabilityMap[Number(u.id)].status === \"busy\" ? \"🔴 \" : availabilityMap[Number(u.id)].status === \"partial\" ? \"🟠 \" : \"🟢 \") : \"\"}{u.name}'

# match everything from {availabilityMap... to {u.name}
content = re.sub(r'\{availabilityMap\[Number\(u\.id\)\] \? \(availabilityMap\[Number\(u\.id\)\].*?\{u\.name\}', repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
