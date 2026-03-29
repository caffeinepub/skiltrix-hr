import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AttendanceStatus } from "../backend.d";
import {
  useEmployeeAttendance,
  useEmployees,
  useMarkAttendance,
} from "../hooks/useQueries";
import { dateToTime, formatDate } from "../lib/dateUtils";

interface Props {
  isAdmin: boolean;
}

const statusOptions = [
  { value: AttendanceStatus.present, label: "Present" },
  { value: AttendanceStatus.absent, label: "Absent" },
  { value: AttendanceStatus.late, label: "Late" },
  { value: AttendanceStatus.halfDay, label: "Half Day" },
];

const statusBadge = (status: string) => {
  if (status === "present")
    return "bg-green-100 text-green-700 hover:bg-green-100";
  if (status === "absent") return "bg-red-100 text-red-700 hover:bg-red-100";
  if (status === "late")
    return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  return "bg-blue-100 text-blue-700 hover:bg-blue-100";
};

export default function Attendance({ isAdmin }: Props) {
  const { data: employees } = useEmployees();
  const markMutation = useMarkAttendance();
  const [selectedEmp, setSelectedEmp] = useState<string>("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});

  const selectedEmployeeId = selectedEmp ? BigInt(selectedEmp) : null;
  const { data: empAttendance } = useEmployeeAttendance(selectedEmployeeId);

  const setStatus = (empId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [empId]: status }));
  };

  const handleMarkAll = async () => {
    if (!employees || !date) return;
    const dateTime = dateToTime(new Date(date));
    const promises = employees
      .filter((e) => attendanceMap[e.id.toString()])
      .map((e) =>
        markMutation.mutateAsync({
          employeeId: e.id,
          date: dateTime,
          status: attendanceMap[e.id.toString()],
        }),
      );
    try {
      await Promise.all(promises);
      toast.success("Attendance marked successfully");
      setAttendanceMap({});
    } catch {
      toast.error("Failed to mark attendance");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and manage staff attendance
        </p>
      </div>

      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Mark Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <input
                  data-ocid="attendance.date.input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border border-input rounded-md px-3 py-2 text-sm bg-background"
                />
              </div>

              {!employees || employees.length === 0 ? (
                <div
                  data-ocid="attendance.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No employees to mark attendance for.
                </div>
              ) : (
                <>
                  <Table data-ocid="attendance.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees
                        .filter((e) => e.status === "active")
                        .map((emp, i) => (
                          <TableRow
                            key={emp.id.toString()}
                            data-ocid={`attendance.item.${i + 1}`}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                  {emp.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium">
                                  {emp.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {emp.department}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={attendanceMap[emp.id.toString()] ?? ""}
                                onValueChange={(v) =>
                                  setStatus(
                                    emp.id.toString(),
                                    v as AttendanceStatus,
                                  )
                                }
                              >
                                <SelectTrigger
                                  data-ocid={`attendance.status.select.${i + 1}`}
                                  className="w-36"
                                >
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <Button
                    data-ocid="attendance.submit_button"
                    onClick={handleMarkAll}
                    disabled={
                      markMutation.isPending ||
                      Object.keys(attendanceMap).length === 0
                    }
                  >
                    {markMutation.isPending ? "Saving..." : "Submit Attendance"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* View attendance by employee */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">View Attendance Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedEmp} onValueChange={setSelectedEmp}>
            <SelectTrigger
              data-ocid="attendance.employee.select"
              className="w-64"
            >
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((emp) => (
                <SelectItem key={emp.id.toString()} value={emp.id.toString()}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedEmployeeId &&
            (!empAttendance || empAttendance.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No records found for this employee.
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
                  {empAttendance
                    .slice()
                    .sort((a, b) => Number(b.date - a.date))
                    .map((rec, i) => (
                      <TableRow
                        key={`${rec.employeeId}-${rec.date}`}
                        data-ocid={`attendance.record.item.${i + 1}`}
                      >
                        <TableCell className="text-sm">
                          {formatDate(rec.date)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusBadge(rec.status)}>
                            {rec.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
