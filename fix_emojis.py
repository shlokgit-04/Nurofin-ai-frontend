file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

import re

# We will use a function to return the replacement string so re.sub doesn't interpret escapes.
def repl(match):
    return 'availabilityMap[Number(u.id)].status === "busy" ? "\U0001F534 " : availabilityMap[Number(u.id)].status === "partial" ? "\U0001F7E0 " : "\U0001F7E2 "'

content = re.sub(
    r'availabilityMap\[Number\(u\.id\)\]\.status === "busy" \? ".*?" : availabilityMap\[Number\(u\.id\)\]\.status === "partial" \? ".*?" : ".*?"',
    repl,
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
