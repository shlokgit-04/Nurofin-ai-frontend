import re

file_path = r'c:\Users\Muneesha\Desktop\Nurofin Executive AI\Nurofin-ai-frontend\app\workcenter\page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''        const [tasksRes, summaryData, insightsData, quartersData, projectsData, usersData] = await Promise.all([
          workcenterService.getTasks({
            quarter_id: selectedQuarterId ?? undefined,
            search: searchQuery || undefined,
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            page_size: 200
          }),
          workcenterService.getSummary(selectedQuarterId ?? undefined),
          workcenterService.getInsights(selectedQuarterId ?? undefined),
          workcenterService.getQuarters(),
          projectsService.getProjects().catch(() => []),
          usersService.getUsers().catch(() => []),
        ]);'''

replacement = '''        const [tasksRes, summaryData, insightsData, quartersData, projectsData, usersData] = await Promise.all([
          workcenterService.getTasks({
            quarter_id: selectedQuarterId ?? undefined,
            search: searchQuery || undefined,
            status: statusFilter || undefined,
            priority: priorityFilter || undefined,
            page_size: 200
          }).catch(() => ({ tasks: [], total: 0 })),
          workcenterService.getSummary(selectedQuarterId ?? undefined).catch(() => null),
          workcenterService.getInsights(selectedQuarterId ?? undefined).catch(() => null),
          workcenterService.getQuarters().catch(() => []),
          projectsService.getProjects().catch(() => []),
          usersService.getUsers().catch(() => []),
        ]);'''

content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
