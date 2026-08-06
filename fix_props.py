import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# For each function that takes allUsers, we should add availabilityMap: Record<number, any>
components = ["KanbanBoard", "TaskTableView", "TaskDetailDialog", "CreateEditTaskDialog", "TransferDialog", "PerformanceView"]

for comp in components:
    # Add to props interface if it's there
    content = re.sub(rf'({comp}\({{\n.*?allUsers,)(.*?}}\s*:\s*{{)', r'\1\n  availabilityMap,\2', content, flags=re.DOTALL)
    # Add to type definition
    content = re.sub(rf'({comp}.*?allUsers: UserType\[\];)(.*?)}}', r'\1\n  availabilityMap: Record<number, any>;\2}', content, flags=re.DOTALL)
    
    # Also add to the call sites inside TaskCenterPage
    content = re.sub(rf'(<{comp}[^>]*?allUsers={{allUsers}})', r'\1 availabilityMap={availabilityMap}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
