import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Plus, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { LeaveType } from "../backend.d";
import {
  useApproveLeave,
  useEmployeeLeaves,
  useEmployees,
  usePendingLeaveRequests,
  useRejectLeave,
  useSubmitLeaveRequest,
} from "../hooks/useQueries";
import { formatDate, parseDateInput } from "../lib/dateUtils";

interface Props {
  isAdmin: boolean;
  currentEmployeeId: bigint | null;
}

const leaveBadge = (status: string) => {
  if (status === "approved")
    return "bg-green-100 text-green-700 hover:bg-green-100";
  if (status === "rejected") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-amber-100 text-amber-700 hover:bg-amber-100";
};

export default function LeaveManagement({ isAdmin, currentEmployeeId }: Props) {
  const { data: employees } = useEmployees();
  const { data: pendingLeaves, isLoading } = usePendingLeaveRequests();
  const { data: myLeaves } = useEmployeeLeaves(currentEmployeeId);
  const submitMutation = useSubmitLeaveRequest();
  const approveMutation = useApproveLeave();
  const rejectMutation = useRejectLeave();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    startDate: "",
    endDate: "",
    leaveType: LeaveType.casual,
    reason: "",
  });
  const [commentMap, setCommentMap] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    if (!form.employeeId || !form.startDate || !form.endDate || !form.reason) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await submitMutation.mutateAsync({
        employeeId: BigInt(form.employeeId),
        startDate: parseDateInput(form.startDate),
        endDate: parseDateInput(form.endDate),
        leaveType: form.leaveType,
        reason: form.reason,
      });
      toast.success("Leave request submitted");
      setOpen(false);
      setForm({
        employeeId: "",
        startDate: "",
        endDate: "",
        leaveType: LeaveType.casual,
        reason: "",
      });
    } catch {
      toast.error("Failed to submit leave request");
    }
  };

  const handleApprove = async (id: bigint) => {
    try {
      await approveMutation.mutateAsync({
        id,
        comments: commentMap[id.toString()] ?? "",
      });
      toast.success("Leave approved");
    } catch {
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (id: bigint) => {
    try {
      await rejectMutation.mutateAsync({
        id,
        comments: commentMap[id.toString()] ?? "",
      });
      toast.success("Leave rejected");
    } catch {
      toast.error("Failed to reject leave");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage staff leave requests
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-ocid="leaves.open_modal_button">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="leaves.dialog" className="max-w-md">
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Employee</Label>
                <Select
                  value={form.employeeId}
                  onValueChange={(v) => setForm({ ...form, employeeId: v })}
                >
                  <SelectTrigger data-ocid="leaves.employee.select">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees?.map((e) => (
                      <SelectItem key={e.id.toString()} value={e.id.toString()}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Date</Label>
                  <Input
                    data-ocid="leaves.start_date.input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Date</Label>
                  <Input
                    data-ocid="leaves.end_date.input"
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Leave Type</Label>
                <Select
                  value={form.leaveType}
                  onValueChange={(v) =>
                    setForm({ ...form, leaveType: v as LeaveType })
                  }
                >
                  <SelectTrigger data-ocid="leaves.type.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Reason</Label>
                <Textarea
                  data-ocid="leaves.reason.textarea"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Reason for leave..."
                />
              </div>
              <Button
                data-ocid="leaves.submit_button"
                className="w-full"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pending leave requests (admin) */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pending Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div
                  data-ocid="leaves.loading_state"
                  className="p-6 text-sm text-muted-foreground"
                >
                  Loading...
                </div>
              ) : !pendingLeaves || pendingLeaves.length === 0 ? (
                <div
                  data-ocid="leaves.pending.empty_state"
                  className="text-center py-12 text-muted-foreground text-sm"
                >
                  No pending requests.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingLeaves.map((leave, i) => {
                      const emp = employees?.find(
                        (e) => e.id === leave.employeeId,
                      );
                      return (
                        <TableRow
                          key={leave.id.toString()}
                          data-ocid={`leaves.pending.item.${i + 1}`}
                        >
                          <TableCell className="font-medium text-sm">
                            {emp?.name ?? `#${leave.employeeId}`}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{leave.leaveType}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(leave.startDate)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {leave.reason}
                          </TableCell>
                          <TableCell>
                            <Input
                              data-ocid={`leaves.comment.input.${i + 1}`}
                              className="w-32 h-7 text-xs"
                              placeholder="Comment..."
                              value={commentMap[leave.id.toString()] ?? ""}
                              onChange={(e) =>
                                setCommentMap((prev) => ({
                                  ...prev,
                                  [leave.id.toString()]: e.target.value,
                                }))
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                data-ocid={`leaves.approve.button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="text-green-600 hover:bg-green-50 hover:text-green-700 h-7 px-2"
                                onClick={() => handleApprove(leave.id)}
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                data-ocid={`leaves.reject.button.${i + 1}`}
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:bg-red-50 hover:text-red-700 h-7 px-2"
                                onClick={() => handleReject(leave.id)}
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* My leaves (non-admin) */}
      {!isAdmin && currentEmployeeId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Leave Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!myLeaves || myLeaves.length === 0 ? (
              <div
                data-ocid="leaves.my.empty_state"
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
                    <TableHead>Comments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeaves.map((leave, i) => (
                    <TableRow
                      key={leave.id.toString()}
                      data-ocid={`leaves.my.item.${i + 1}`}
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
                      <TableCell className="text-sm text-muted-foreground">
                        {leave.comments}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
