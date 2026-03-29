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
import { Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddPayroll,
  useAllPayroll,
  useEmployees,
} from "../hooks/useQueries";
import { monthName } from "../lib/dateUtils";

interface Props {
  isAdmin: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][i],
}));

export default function Payroll({ isAdmin }: Props) {
  const { data: employees } = useEmployees();
  const { data: allPayroll, isLoading } = useAllPayroll();
  const addMutation = useAddPayroll();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    month: "",
    year: String(new Date().getFullYear()),
    basicSalary: "",
    allowances: "0",
    deductions: "0",
    netPay: "",
  });

  const handleSubmit = async () => {
    if (
      !form.employeeId ||
      !form.month ||
      !form.year ||
      !form.basicSalary ||
      !form.netPay
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await addMutation.mutateAsync({
        employeeId: BigInt(form.employeeId),
        month: BigInt(form.month),
        year: BigInt(form.year),
        basicSalary: BigInt(form.basicSalary),
        allowances: BigInt(form.allowances || "0"),
        deductions: BigInt(form.deductions || "0"),
        netPay: BigInt(form.netPay),
      });
      toast.success("Payroll record added");
      setOpen(false);
      setForm({
        employeeId: "",
        month: "",
        year: String(new Date().getFullYear()),
        basicSalary: "",
        allowances: "0",
        deductions: "0",
        netPay: "",
      });
    } catch {
      toast.error("Failed to add payroll record");
    }
  };

  const getEmployeeName = (id: bigint) =>
    employees?.find((e) => e.id === id)?.name ?? `#${id}`;

  const autoNetPay = () => {
    const basic = Number(form.basicSalary || 0);
    const allowances = Number(form.allowances || 0);
    const deductions = Number(form.deductions || 0);
    setForm((prev) => ({
      ...prev,
      netPay: String(basic + allowances - deductions),
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Monthly salary records
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-ocid="payroll.open_modal_button">
                <Plus className="w-4 h-4 mr-2" />
                Add Record
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="payroll.dialog" className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Payroll Record</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Employee</Label>
                  <Select
                    value={form.employeeId}
                    onValueChange={(v) => {
                      const emp = employees?.find((e) => e.id.toString() === v);
                      setForm({
                        ...form,
                        employeeId: v,
                        basicSalary: emp?.salary.toString() ?? "",
                      });
                    }}
                  >
                    <SelectTrigger data-ocid="payroll.employee.select">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees?.map((e) => (
                        <SelectItem
                          key={e.id.toString()}
                          value={e.id.toString()}
                        >
                          {e.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Month</Label>
                    <Select
                      value={form.month}
                      onValueChange={(v) => setForm({ ...form, month: v })}
                    >
                      <SelectTrigger data-ocid="payroll.month.select">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Year</Label>
                    <Input
                      data-ocid="payroll.year.input"
                      type="number"
                      value={form.year}
                      onChange={(e) =>
                        setForm({ ...form, year: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Basic Salary (PKR)</Label>
                  <Input
                    data-ocid="payroll.basic_salary.input"
                    type="number"
                    value={form.basicSalary}
                    onChange={(e) =>
                      setForm({ ...form, basicSalary: e.target.value })
                    }
                    onBlur={autoNetPay}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Allowances</Label>
                    <Input
                      data-ocid="payroll.allowances.input"
                      type="number"
                      value={form.allowances}
                      onChange={(e) =>
                        setForm({ ...form, allowances: e.target.value })
                      }
                      onBlur={autoNetPay}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Deductions</Label>
                    <Input
                      data-ocid="payroll.deductions.input"
                      type="number"
                      value={form.deductions}
                      onChange={(e) =>
                        setForm({ ...form, deductions: e.target.value })
                      }
                      onBlur={autoNetPay}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Net Pay (PKR)</Label>
                  <Input
                    data-ocid="payroll.net_pay.input"
                    type="number"
                    value={form.netPay}
                    onChange={(e) =>
                      setForm({ ...form, netPay: e.target.value })
                    }
                    className="font-semibold"
                  />
                </div>
                <Button
                  data-ocid="payroll.submit_button"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={addMutation.isPending}
                >
                  {addMutation.isPending ? "Adding..." : "Add Record"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div
                data-ocid="payroll.loading_state"
                className="p-6 text-sm text-muted-foreground"
              >
                Loading...
              </div>
            ) : !allPayroll || allPayroll.length === 0 ? (
              <div
                data-ocid="payroll.empty_state"
                className="text-center py-16 text-muted-foreground"
              >
                <p className="font-medium">No payroll records yet</p>
                <p className="text-sm mt-1">
                  Add your first payroll record to get started
                </p>
              </div>
            ) : (
              <Table data-ocid="payroll.table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Basic (PKR)</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay (PKR)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPayroll.map((rec, i) => (
                    <TableRow
                      key={`payroll-${rec.employeeId}-${rec.month}-${rec.year}`}
                      data-ocid={`payroll.item.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {getEmployeeName(rec.employeeId)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {monthName(rec.month)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rec.year.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {rec.basicSalary.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-green-600">
                        +{rec.allowances.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-red-600">
                        -{rec.deductions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-bold text-primary">
                        {rec.netPay.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
