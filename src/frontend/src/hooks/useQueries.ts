import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AttendanceStatus,
  EmployeeRole,
  EmployeeStatus,
  LeaveType,
} from "../backend.d";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEmployees();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployee(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employee", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getEmployee(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDepartments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDepartments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingLeaveRequests() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingLeaves"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingLeaveRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployeeLeaves(employeeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaves", employeeId?.toString()],
    queryFn: async () => {
      if (!actor || employeeId === null) return [];
      return actor.getLeaveRequestsByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && employeeId !== null,
  });
}

export function useEmployeeAttendance(employeeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["attendance", employeeId?.toString()],
    queryFn: async () => {
      if (!actor || employeeId === null) return [];
      return actor.getEmployeeAttendance(employeeId);
    },
    enabled: !!actor && !isFetching && employeeId !== null,
  });
}

export function useAllPayroll() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payroll"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayrollRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEmployeePayroll(employeeId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["payroll", employeeId?.toString()],
    queryFn: async () => {
      if (!actor || employeeId === null) return [];
      return actor.getPayrollByEmployee(employeeId);
    },
    enabled: !!actor && !isFetching && employeeId !== null,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useAddEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone: string;
      role: EmployeeRole;
      department: string;
      salary: bigint;
    }) =>
      actor!.addEmployee(
        data.name,
        data.email,
        data.phone,
        data.role,
        data.department,
        data.salary,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useUpdateEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      id: bigint;
      name: string;
      email: string;
      phone: string;
      role: EmployeeRole;
      department: string;
      salary: bigint;
      status: EmployeeStatus;
      joinDate: bigint;
    }) =>
      actor!.updateEmployee(data.id, {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        department: data.department,
        salary: data.salary,
        status: data.status,
        joinDate: data.joinDate,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["employee"] });
    },
  });
}

export function useDeleteEmployee() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.deleteEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees"] }),
  });
}

export function useAddDepartment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; headName: string }) =>
      actor!.addDepartment(data.name, data.headName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["departments"] }),
  });
}

export function useMarkAttendance() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employeeId: bigint;
      date: bigint;
      status: AttendanceStatus;
    }) => actor!.markAttendance(data.employeeId, data.date, data.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["attendance"] }),
  });
}

export function useSubmitLeaveRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employeeId: bigint;
      startDate: bigint;
      endDate: bigint;
      leaveType: LeaveType;
      reason: string;
    }) =>
      actor!.submitLeaveRequest(
        data.employeeId,
        data.startDate,
        data.endDate,
        data.leaveType,
        data.reason,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["pendingLeaves"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useApproveLeave() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: bigint; comments: string }) =>
      actor!.approveLeaveRequest(data.id, data.comments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["pendingLeaves"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRejectLeave() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: bigint; comments: string }) =>
      actor!.rejectLeaveRequest(data.id, data.comments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leaves"] });
      qc.invalidateQueries({ queryKey: ["pendingLeaves"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAddPayroll() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      employeeId: bigint;
      month: bigint;
      year: bigint;
      basicSalary: bigint;
      allowances: bigint;
      deductions: bigint;
      netPay: bigint;
    }) =>
      actor!.addPayrollRecord(
        data.employeeId,
        data.month,
        data.year,
        data.basicSalary,
        data.allowances,
        data.deductions,
        data.netPay,
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payroll"] }),
  });
}
