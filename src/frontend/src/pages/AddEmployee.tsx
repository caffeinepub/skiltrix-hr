import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { EmployeeRole } from "../backend.d";
import { useAddEmployee, useDepartments } from "../hooks/useQueries";

export default function AddEmployee() {
  const addMutation = useAddEmployee();
  const { data: departments } = useDepartments();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: EmployeeRole.teacher,
    department: "",
    salary: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.department ||
      !form.salary
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addMutation.mutateAsync({
        ...form,
        salary: BigInt(form.salary),
      });
      toast.success("Employee added successfully");
      setForm({
        name: "",
        email: "",
        phone: "",
        role: EmployeeRole.teacher,
        department: "",
        salary: "",
      });
    } catch {
      toast.error("Failed to add employee");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add Employee</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Register a new staff member
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="w-4 h-4 text-primary" />
              New Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  data-ocid="add_employee.name.input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ahmed Ali"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  data-ocid="add_employee.email.input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. ahmed@skiltrix.edu"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  data-ocid="add_employee.phone.input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +92 300 1234567"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) =>
                    setForm({ ...form, role: v as EmployeeRole })
                  }
                >
                  <SelectTrigger data-ocid="add_employee.role.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Department *</Label>
                <Select
                  value={form.department}
                  onValueChange={(v) => setForm({ ...form, department: v })}
                >
                  <SelectTrigger data-ocid="add_employee.dept.select">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id.toString()} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                    {(!departments || departments.length === 0) && (
                      <div className="p-2 text-xs text-muted-foreground">
                        No departments yet. Add one first.
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="salary">Salary (PKR) *</Label>
                <Input
                  id="salary"
                  data-ocid="add_employee.salary.input"
                  type="number"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="sm:col-span-2 pt-2">
                <Button
                  data-ocid="add_employee.submit_button"
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending
                    ? "Adding Employee..."
                    : "Add Employee"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
