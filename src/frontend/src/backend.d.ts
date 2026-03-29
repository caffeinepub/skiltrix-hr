import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Stats {
    totalEmployees: bigint;
    departments: bigint;
    pendingLeaveRequests: bigint;
}
export interface PayrollRecord {
    month: bigint;
    year: bigint;
    deductions: bigint;
    netPay: bigint;
    employeeId: bigint;
    allowances: bigint;
    basicSalary: bigint;
}
export interface Department {
    id: bigint;
    headName: string;
    name: string;
}
export interface LeaveRequest {
    id: bigint;
    status: LeaveStatus;
    endDate: Time;
    employeeId: bigint;
    comments: string;
    leaveType: LeaveType;
    startDate: Time;
    reason: string;
}
export interface Employee {
    id: bigint;
    status: EmployeeStatus;
    salary: bigint;
    joinDate: Time;
    name: string;
    role: EmployeeRole;
    email: string;
    phone: string;
    department: string;
}
export interface AttendanceRecord {
    status: AttendanceStatus;
    date: Time;
    employeeId: bigint;
}
export interface UserProfile {
    name: string;
    employeeId: bigint;
}
export enum AttendanceStatus {
    halfDay = "halfDay",
    present = "present",
    late = "late",
    absent = "absent"
}
export enum EmployeeRole {
    admin = "admin",
    teacher = "teacher",
    staff = "staff"
}
export enum EmployeeStatus {
    active = "active",
    inactive = "inactive"
}
export enum LeaveStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum LeaveType {
    sick = "sick",
    annual = "annual",
    maternity = "maternity",
    casual = "casual"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDepartment(name: string, headName: string): Promise<bigint>;
    addEmployee(name: string, email: string, phone: string, role: EmployeeRole, department: string, salary: bigint): Promise<bigint>;
    addPayrollRecord(employeeId: bigint, month: bigint, year: bigint, basicSalary: bigint, allowances: bigint, deductions: bigint, netPay: bigint): Promise<void>;
    approveLeaveRequest(id: bigint, comments: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEmployee(id: bigint): Promise<void>;
    getAllEmployees(): Promise<Array<Employee>>;
    getAllPayrollRecords(): Promise<Array<PayrollRecord>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDepartments(): Promise<Array<Department>>;
    getEmployee(id: bigint): Promise<Employee | null>;
    getEmployeeAttendance(employeeId: bigint): Promise<Array<AttendanceRecord>>;
    getLeaveRequestsByEmployee(employeeId: bigint): Promise<Array<LeaveRequest>>;
    getPayrollByEmployee(employeeId: bigint): Promise<Array<PayrollRecord>>;
    getPendingLeaveRequests(): Promise<Array<LeaveRequest>>;
    getStats(): Promise<Stats>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markAttendance(employeeId: bigint, date: Time, status: AttendanceStatus): Promise<void>;
    rejectLeaveRequest(id: bigint, comments: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitLeaveRequest(employeeId: bigint, startDate: Time, endDate: Time, leaveType: LeaveType, reason: string): Promise<bigint>;
    updateEmployee(id: bigint, employee: Employee): Promise<void>;
}
