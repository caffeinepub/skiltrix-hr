import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddDepartment,
  useDepartments,
  useEmployees,
} from "../hooks/useQueries";

interface Props {
  isAdmin: boolean;
}

export default function Departments({ isAdmin }: Props) {
  const { data: departments, isLoading } = useDepartments();
  const { data: employees } = useEmployees();
  const addMutation = useAddDepartment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", headName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.headName) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await addMutation.mutateAsync(form);
      toast.success("Department added successfully");
      setOpen(false);
      setForm({ name: "", headName: "" });
    } catch {
      toast.error("Failed to add department");
    }
  };

  const getStaffCount = (deptName: string) =>
    employees?.filter((e) => e.department === deptName).length ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage academy departments
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-ocid="departments.open_modal_button">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="departments.dialog" className="max-w-sm">
              <DialogHeader>
                <DialogTitle>New Department</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Department Name *</Label>
                  <Input
                    data-ocid="departments.name.input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Mathematics"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Head Name *</Label>
                  <Input
                    data-ocid="departments.head.input"
                    value={form.headName}
                    onChange={(e) =>
                      setForm({ ...form, headName: e.target.value })
                    }
                    placeholder="e.g. Prof. Tariq Shah"
                  />
                </div>
                <Button
                  data-ocid="departments.submit_button"
                  type="submit"
                  className="w-full"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Department"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div
          data-ocid="departments.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      ) : !departments || departments.length === 0 ? (
        <div
          data-ocid="departments.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No departments yet</p>
          <p className="text-sm mt-1">
            Add your first department to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.id.toString()}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card
                data-ocid={`departments.item.${i + 1}`}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      <Users className="w-3 h-3" />
                      {getStaffCount(dept.name)}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Head: {dept.headName}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
