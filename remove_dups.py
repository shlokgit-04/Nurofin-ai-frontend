import os
path = "app/planner/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);\n  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);\n", "", 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
