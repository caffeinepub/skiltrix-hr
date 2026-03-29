import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Building2,
  Clock,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useDepartments,
  useEmployees,
  usePendingLeaveRequests,
  useStats,
} from "../hooks/useQueries";
import { formatDate } from "../lib/dateUtils";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: employees } = useEmployees();
  const { data: pendingLeaves } = usePendingLeaveRequests();
  const { data: departments } = useDepartments();

  const statCards = [
    {
      title: "Total Staff",
      value: statsLoading ? null : (stats?.totalEmployees?.toString() ?? "0"),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Employees",
      value: statsLoading
        ? null
        : (employees?.filter((e) => e.status === "active").length.toString() ??
          "0"),
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Pending Leaves",
      value: statsLoading
        ? null
        : (stats?.pendingLeaveRequests?.toString() ?? "0"),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Departments",
      value: statsLoading ? null : (stats?.departments?.toString() ?? "0"),
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome to Skiltrix HR Management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              data-ocid={`dashboard.${card.title.toLowerCase().replace(/ /g, "_")}.card`}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {card.title}
                    </p>
                    {card.value === null ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground mt-0.5">
                        {card.value}
                      </p>
                    )}
                  </div>
                  <div
                    className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}
                  >
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4 text-primary" />
                Recent Staff
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!employees || employees.length === 0 ? (
                <div
                  data-ocid="dashboard.staff.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No employees yet. Add your first employee to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.slice(0, 5).map((emp, i) => (
                    <div
                      key={emp.id.toString()}
                      data-ocid={`dashboard.staff.item.${i + 1}`}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {emp.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{emp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {emp.department}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          emp.status === "active" ? "default" : "secondary"
                        }
                        className={
                          emp.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }
                      >
                        {emp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Leaves */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Pending Leave Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!pendingLeaves || pendingLeaves.length === 0 ? (
                <div
                  data-ocid="dashboard.leaves.empty_state"
                  className="text-center py-8 text-muted-foreground text-sm"
                >
                  No pending leave requests.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingLeaves.slice(0, 5).map((leave, i) => {
                    const emp = employees?.find(
                      (e) => e.id === leave.employeeId,
                    );
                    return (
                      <div
                        key={leave.id.toString()}
                        data-ocid={`dashboard.leaves.item.${i + 1}`}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {emp?.name ?? `Employee #${leave.employeeId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {leave.leaveType} · {formatDate(leave.startDate)} –{" "}
                            {formatDate(leave.endDate)}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                          Pending
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Departments Overview */}
      {departments && departments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="w-4 h-4 text-primary" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {departments.map((dept, i) => (
                  <div
                    key={dept.id.toString()}
                    data-ocid={`dashboard.dept.item.${i + 1}`}
                    className="p-3 rounded-lg bg-secondary border border-border"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {dept.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dept.headName}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
