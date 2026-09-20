import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormDrawer } from "@/components/shared/form-drawer";
import {
  PROJECT_STATUSES,
  TASK_STATUSES,
  WORK_PRIORITIES,
  useCreateProject,
  useCreateTask,
  useUpdateProject,
  useUpdateTask,
  type CloudMember,
  type CloudOrganization,
  type CloudProject,
  type CloudTask,
  type ProjectStatus,
  type TaskStatus,
  type WorkPriority,
} from "@/hooks/use-cloud";

export const prettyStatus = (value: string) =>
  value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function memberLabel(members: CloudMember[], userId: string | null) {
  if (!userId) return "Unassigned";
  const match = members.find((m) => m.user_id === userId);
  return match?.profile?.full_name || match?.profile?.email || "Member";
}

export function OrgSwitcher({
  orgs,
  value,
  onChange,
}: {
  orgs: CloudOrganization[];
  value: string | undefined;
  onChange: (id: string) => void;
}) {
  if (!orgs.length) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full min-w-0 sm:w-[220px]" aria-label="Organization">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {orgs.map((o) => (
          <SelectItem key={o.id} value={o.id}>
            {o.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MemberSelect({
  value,
  onChange,
  members,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  members: CloudMember[];
  label: string;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Unassigned</SelectItem>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.user_id}>
            {member.profile?.full_name || member.profile?.email || "Member"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CreateProjectDrawer({
  organizationId,
  members,
}: {
  organizationId: string | undefined;
  members: CloudMember[];
}) {
  const create = useCreateProject(organizationId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("planned");
  const [priority, setPriority] = useState<WorkPriority>("medium");
  const [managerId, setManagerId] = useState("none");
  const [due, setDue] = useState("");

  return (
    <FormDrawer
      trigger={
        <Button size="sm" disabled={!organizationId}>
          <Plus className="size-4" /> New project
        </Button>
      }
      title="Create project"
      description="Projects are stored in your live workspace and feed the dashboard counts."
      submitLabel="Create project"
      onSubmit={async () => {
        if (!name.trim() || !category.trim()) {
          toast.error("Project name and category are required");
          return false;
        }
        try {
          await create.mutateAsync({
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            status,
            priority,
            manager_id: managerId === "none" ? null : managerId,
            due_date: due || null,
          });
          toast.success("Project created");
          setName("");
          setDescription("");
          setCategory("");
          setDue("");
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not create project");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="lp-name">Project name</Label>
          <Input id="lp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Corporate Website Revamp" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lp-desc">Description</Label>
          <Textarea id="lp-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lp-category">Category</Label>
            <Input id="lp-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Website, Marketing, Operations…" />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as WorkPriority)}>
              <SelectTrigger aria-label="Project priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORK_PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>{prettyStatus(item)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Project manager</Label>
            <MemberSelect value={managerId} onChange={setManagerId} members={members} label="Project manager" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lp-due">Due date</Label>
            <Input id="lp-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Initial status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger aria-label="Initial project status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>{prettyStatus(item)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </FormDrawer>
  );
}

export function CreateTaskDrawer({
  organizationId,
  members,
  projects,
  defaultProjectId,
  variant = "default",
}: {
  organizationId: string | undefined;
  members: CloudMember[];
  projects: CloudProject[];
  defaultProjectId?: string;
  variant?: "default" | "outline";
}) {
  const create = useCreateTask(organizationId);
  const [projectId, setProjectId] = useState(defaultProjectId ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");
  const [priority, setPriority] = useState<WorkPriority>("medium");
  const [assigneeId, setAssigneeId] = useState("none");
  const [due, setDue] = useState("");

  const selectedProject = projectId || defaultProjectId || projects[0]?.id || "";

  return (
    <FormDrawer
      trigger={
        <Button size="sm" variant={variant} disabled={!projects.length}>
          <Plus className="size-4" /> New task
        </Button>
      }
      title="Create task"
      description="Assign live work with a category, priority and workflow status."
      submitLabel="Create task"
      onSubmit={async () => {
        if (!selectedProject || !title.trim() || !category.trim()) {
          toast.error("Project, task title and category are required");
          return false;
        }
        try {
          await create.mutateAsync({
            project_id: selectedProject,
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            status,
            priority,
            assignee_id: assigneeId === "none" ? null : assigneeId,
            due_date: due || null,
          });
          toast.success("Task created");
          setTitle("");
          setDescription("");
          setCategory("");
          setDue("");
          return true;
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Could not create task");
          return false;
        }
      }}
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Project</Label>
          <Select value={selectedProject} onValueChange={setProjectId}>
            <SelectTrigger aria-label="Task project"><SelectValue placeholder="Select project" /></SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lt-title">Task title</Label>
          <Input id="lt-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Prepare homepage wireframe" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lt-desc">Description</Label>
          <Textarea id="lt-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lt-category">Category</Label>
            <Input id="lt-category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Design, Content, QA…" />
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as WorkPriority)}>
              <SelectTrigger aria-label="Task priority"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WORK_PRIORITIES.map((item) => (
                  <SelectItem key={item} value={item}>{prettyStatus(item)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Assignee</Label>
            <MemberSelect value={assigneeId} onChange={setAssigneeId} members={members} label="Task assignee" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lt-due">Due date</Label>
            <Input id="lt-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Initial status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger aria-label="Initial task status"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>{prettyStatus(item)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </FormDrawer>
  );
}

export function projectProgress(project: CloudProject, tasks: CloudTask[]) {
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  if (!projectTasks.length) return project.progress;
  const completed = projectTasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / projectTasks.length) * 100);
}

export function LiveProjectCard({
  project,
  tasks,
  members,
  canManage,
  footer,
}: {
  project: CloudProject;
  tasks: CloudTask[];
  members: CloudMember[];
  canManage: boolean;
  footer?: React.ReactNode;
}) {
  const updateProject = useUpdateProject();
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const progress = projectProgress(project, tasks);

  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{project.category}</p>
          <h3 className="truncate text-base font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.description || "No description"}</p>
        </div>
        <Badge variant="outline">{prettyStatus(project.priority)}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Progress</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="mt-2 h-1.5" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Select
          value={project.status}
          disabled={!canManage}
          onValueChange={(value) => updateProject.mutate({ id: project.id, status: value as ProjectStatus })}
        >
          <SelectTrigger aria-label={`${project.name} status`} className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PROJECT_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>{prettyStatus(status)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <MemberSelect
          value={project.manager_id ?? "none"}
          disabled={!canManage}
          members={members}
          label={`${project.name} manager`}
          onChange={(value) => updateProject.mutate({ id: project.id, manager_id: value === "none" ? null : value })}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {projectTasks.length} tasks · Manager: {memberLabel(members, project.manager_id)}
        {project.due_date ? ` · Due ${new Date(`${project.due_date}T00:00:00`).toLocaleDateString()}` : ""}
      </p>
      {footer}
    </article>
  );
}

export function LiveTaskRow({
  task,
  projectName,
  members,
}: {
  task: CloudTask;
  projectName: string;
  members: CloudMember[];
}) {
  const updateTask = useUpdateTask();
  return (
    <li className="grid gap-2 py-3 sm:grid-cols-[1fr_120px_150px_170px] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{task.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {projectName} · {task.category} · {prettyStatus(task.priority)}
        </p>
      </div>
      <p className="truncate text-xs text-muted-foreground sm:text-sm">
        {task.due_date ? new Date(`${task.due_date}T00:00:00`).toLocaleDateString() : "No due date"}
      </p>
      <Select value={task.status} onValueChange={(value) => updateTask.mutate({ id: task.id, status: value as TaskStatus })}>
        <SelectTrigger aria-label={`${task.title} status`} className="h-8"><SelectValue /></SelectTrigger>
        <SelectContent>
          {TASK_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>{prettyStatus(status)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <MemberSelect
        value={task.assignee_id ?? "none"}
        members={members}
        label={`${task.title} assignee`}
        onChange={(value) => updateTask.mutate({ id: task.id, assignee_id: value === "none" ? null : value })}
      />
    </li>
  );
}
