import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit2, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { EmployeeRole, EmployeeStatus } from "../backend.d";
import {
  useEmployee,
  useEmployeeAttendance,
  useEmployeeLeaves,
  useUpdateEmployee,
} from "../hooks/useQueries";
import { formatDate } from "../lib/dateUtils";

interface Props {
  employeeId: bigint;
  onBack: () => void;
}

export default function EmployeeProfile({ employeeId, onBack }: Props) {
  const { data: employee, isLoading } = useEmployee(employeeId);
  const { data: attendance } = useEmployeeAttendance(employeeId);
  const { data: leaves } = useEmployeeLeaves(employeeId);
  const updateMutation = useUpdateEmployee();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    role: EmployeeRole;
    department: string;
    salary: string;
    status: EmployeeStatus;
  } | null>(null);

  const startEdit = () => {
    if (!employee) return;
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department,
      salary: employee.salary.toString(),
      status: employee.status,
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form || !employee) return;
    try {
      await updateMutation.mutateAsync({
        id: employee.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        department: form.department,
        salary: BigInt(form.salary || "0"),
        status: form.status,
        joinDate: employee.joinDate,
      });
      toast.success("Employee updated successfully");
      setEditing(false);
    } catch {
      toast.error("Failed to update employee");
    }
  };

  const attendanceBadge = (status: string) => {
    if (status === "present")
      return "bg-green-100 text-green-700 hover:bg-green-100";
    if (status === "absent") return "bg-red-100 text-red-700 hover:bg-red-100";
    if (status === "late")
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    return "bg-blue-100 text-blue-700 hover:bg-blue-100";
  };

  const leaveBadge = (status: string) => {
    if (status === "approved")
      return "bg-green-100 text-green-700 hover:bg-green-100";
    if (status === "rejected")
      return "bg-red-100 text-red-700 hover:bg-red-100";
    return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4" data-ocid="profile.loading_state">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-muted-foreground mt-4">Employee not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          data-ocid="profile.back.button"
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{employee.name}</h1>
          <p className="text-muted-foreground text-sm">
            {employee.department} · {employee.role}
          </p>
        </div>
        {!editing ? (
          <Button
            data-ocid="profile.edit.button"
            variant="outline"
            size="sm"
            onClick={startEdit}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              data-ocid="profile.save.button"
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              data-ocid="profile.cancel.button"
              variant="outline"
              size="sm"
              onClick={() => setEditing(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger data-ocid="profile.details.tab" value="details">
              Details
            </TabsTrigger>
            <TabsTrigger data-ocid="profile.attendance.tab" value="attendance">
              Attendance
            </TabsTrigger>
            <TabsTrigger data-ocid="profile.leaves.tab" value="leaves">
              Leave History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {editing && form ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input
                        data-ocid="profile.name.input"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input
                        data-ocid="profile.email.input"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input
                        data-ocid="profile.phone.input"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Department</Label>
                      <Input
                        data-ocid="profile.dept.input"
                        value={form.department}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Role</Label>
                      <Select
                        value={form.role}
                        onValueChange={(v) =>
                          setForm({ ...form, role: v as EmployeeRole })
                        }
                      >
                        <SelectTrigger data-ocid="profile.role.select">
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
                      <Label>Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) =>
                          setForm({ ...form, status: v as EmployeeStatus })
                        }
                      >
                        <SelectTrigger data-ocid="profile.status.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Salary (PKR)</Label>
                      <Input
                        data-ocid="profile.salary.input"
                        type="number"
                        value={form.salary}
                        onChange={(e) =>
                          setForm({ ...form, salary: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoRow label="Full Name" value={employee.name} />
                    <InfoRow label="Email" value={employee.email} />
                    <InfoRow label="Phone" value={employee.phone} />
                    <InfoRow label="Department" value={employee.department} />
                    <InfoRow
                      label="Role"
                      value={
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                          {employee.role}
                        </Badge>
                      }
                    />
                    <InfoRow
                      label="Status"
                      value={
                        <Badge
                          className={
                            employee.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {employee.status}
                        </Badge>
                      }
                    />
                    <InfoRow
                      label="Join Date"
                      value={formatDate(employee.joinDate)}
                    />
                    <InfoRow
                      label="Salary (PKR)"
                      value={`PKR ${employee.salary.toLocaleString()}`}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attendance History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!attendance || attendance.length === 0 ? (
                  <div
                    data-ocid="profile.attendance.empty_state"
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No attendance records found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance
                        .slice()
                        .sort((a, b) => Number(b.date - a.date))
                        .map((rec, i) => (
                          <TableRow
                            key={`${rec.employeeId}-${rec.date}`}
                            data-ocid={`profile.attendance.item.${i + 1}`}
                          >
                            <TableCell className="text-sm">
                              {formatDate(rec.date)}
                            </TableCell>
                            <TableCell>
                              <Badge className={attendanceBadge(rec.status)}>
                                {rec.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Leave History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!leaves || leaves.length === 0 ? (
                  <div
                    data-ocid="profile.leaves.empty_state"
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    No leave requests found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((leave, i) => (
                        <TableRow
                          key={leave.id.toString()}
                          data-ocid={`profile.leaves.item.${i + 1}`}
                        >
                          <TableCell>
                            <Badge variant="outline">{leave.leaveType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(leave.startDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell>
                            <Badge className={leaveBadge(leave.status)}>
                              {leave.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {leave.reason}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-medium mt-0.5">{value}</p>
    </div>
  );
}
