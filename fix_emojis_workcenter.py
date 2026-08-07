import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The garbled text is: {availabilityMap[Number(u.id)] ? (availabilityMap[Number(u.id)].status === "busy" ? "dY"' " : availabilityMap[Number(u.id)].status === "partial" ? "dYY " : "dYY ") : ""}{u.name}
# We need to replace anything from {availabilityMap... to {u.name} with the correct string.

def repl(match):
    return '{availabilityMap[Number(u.id)] ? (availabilityMap[Number(u.id)].status === \"busy\" ? \"🔴 \" : availabilityMap[Number(u.id)].status === \"partial\" ? \"🟠 \" : \"🟢 \") : \"\"}{u.name}'

content = re.sub(r'\{availabilityMap\[Number\(u\.id\)\] \? \(availabilityMap.*?\{u\.name\}', repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
