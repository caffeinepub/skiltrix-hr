import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Set "mo:core/Set";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module Employee {
    public func compare(employee1 : Employee, employee2 : Employee) : Order.Order {
      Nat.compare(employee1.id, employee2.id);
    };
  };

  type UserRole = AccessControl.UserRole;

  type Department = {
    id : Nat;
    name : Text;
    headName : Text;
  };

  type EmployeeStatus = {
    #active;
    #inactive;
  };

  type EmployeeRole = {
    #admin;
    #teacher;
    #staff;
  };

  type Employee = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    role : EmployeeRole;
    department : Text;
    joinDate : Time.Time;
    salary : Nat;
    status : EmployeeStatus;
  };

  type AttendanceStatus = {
    #present;
    #absent;
    #late;
    #halfDay;
  };

  type AttendanceRecord = {
    employeeId : Nat;
    date : Time.Time;
    status : AttendanceStatus;
  };

  type LeaveType = {
    #sick;
    #casual;
    #annual;
    #maternity;
  };

  type LeaveStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type LeaveRequest = {
    id : Nat;
    employeeId : Nat;
    startDate : Time.Time;
    endDate : Time.Time;
    leaveType : LeaveType;
    reason : Text;
    status : LeaveStatus;
    comments : Text;
  };

  type PayrollRecord = {
    employeeId : Nat;
    month : Nat;
    year : Nat;
    basicSalary : Nat;
    allowances : Nat;
    deductions : Nat;
    netPay : Nat;
  };

  type Stats = {
    totalEmployees : Nat;
    departments : Nat;
    pendingLeaveRequests : Nat;
  };

  type UserProfile = {
    employeeId : Nat;
    name : Text;
  };

  module PayrollRecord {
    public func compare(record1 : PayrollRecord, record2 : PayrollRecord) : Order.Order {
      switch (Nat.compare(record1.year, record2.year)) {
        case (#equal) {
          switch (Nat.compare(record1.month, record2.month)) {
            case (#equal) { Nat.compare(record1.employeeId, record2.employeeId) };
            case (order) { order };
          };
        };
        case (order) { order };
      };
    };
  };

  // Include authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var employeeIdCounter = 1;
  var departmentIdCounter = 1;
  var leaveRequestIdCounter = 1;

  let departments = Map.empty<Nat, Department>();
  let employees = Map.empty<Nat, Employee>();
  let employeeEmails = Map.empty<Text, Nat>();
  let attendanceRecords = List.empty<AttendanceRecord>();
  let leaveRequests = Map.empty<Nat, LeaveRequest>();
  let payrollRecords = List.empty<PayrollRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Helper function to get employee ID for a caller
  func getEmployeeIdForCaller(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (?profile) { ?profile.employeeId };
      case (null) { null };
    };
  };

  // Departments
  public shared ({ caller }) func addDepartment(name : Text, headName : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let id = departmentIdCounter;
    let department : Department = { id; name; headName };
    departments.add(id, department);
    departmentIdCounter += 1;
    id;
  };

  public query ({ caller }) func getDepartments() : async [Department] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    departments.values().toArray();
  };

  // Employees
  public shared ({ caller }) func addEmployee(name : Text, email : Text, phone : Text, role : EmployeeRole, department : Text, salary : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (employeeEmails.containsKey(email)) {
      Runtime.trap("An employee with this email already exists. Please use another email.");
    };

    let id = employeeIdCounter;
    let employee : Employee = {
      id;
      name;
      email;
      phone;
      role;
      department;
      joinDate = Time.now();
      salary;
      status = #active;
    };
    employees.add(id, employee);

    // Store email in set
    employeeEmails.add(email, id);

    employeeIdCounter += 1;
    id;
  };

  public shared ({ caller }) func updateEmployee(id : Nat, employee : Employee) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not employees.containsKey(id)) { Runtime.trap("Employee does not exist. ") };
    employees.add(id, employee);
  };

  public shared ({ caller }) func deleteEmployee(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    employees.remove(id);
  };

  public query ({ caller }) func getEmployee(id : Nat) : async ?Employee {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only view their own employee record
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?employeeId) {
          if (employeeId != id) {
            Runtime.trap("Unauthorized: Staff can only view their own data");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    };

    employees.get(id);
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only view their own employee record
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?employeeId) {
          switch (employees.get(employeeId)) {
            case (?employee) { [employee] };
            case (null) { [] };
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    } else {
      employees.values().toArray().sort();
    };
  };

  // Attendance
  public shared ({ caller }) func markAttendance(employeeId : Nat, date : Time.Time, status : AttendanceStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (not employees.containsKey(employeeId)) { Runtime.trap("Employee does not exist. ") };

    let record : AttendanceRecord = { employeeId; date; status };
    attendanceRecords.add(record);
  };

  public query ({ caller }) func getEmployeeAttendance(employeeId : Nat) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only view their own attendance
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?callerEmployeeId) {
          if (callerEmployeeId != employeeId) {
            Runtime.trap("Unauthorized: Staff can only view their own data");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    };

    attendanceRecords.filter(func(a) { a.employeeId == employeeId }).toArray();
  };

  // Leave Management
  public shared ({ caller }) func submitLeaveRequest(employeeId : Nat, startDate : Time.Time, endDate : Time.Time, leaveType : LeaveType, reason : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only submit leave requests for themselves
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?callerEmployeeId) {
          if (callerEmployeeId != employeeId) {
            Runtime.trap("Unauthorized: Staff can only submit leave requests for themselves");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    };

    let id = leaveRequestIdCounter;
    let request : LeaveRequest = {
      id;
      employeeId;
      startDate;
      endDate;
      leaveType;
      reason;
      status = #pending;
      comments = "";
    };
    leaveRequests.add(id, request);
    leaveRequestIdCounter += 1;
    id;
  };

  public shared ({ caller }) func approveLeaveRequest(id : Nat, comments : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leaveRequests.get(id)) {
      case (null) { Runtime.trap("Leave request does not exist. ") };
      case (?request) {
        let updatedRequest = { request with status = #approved; comments };
        leaveRequests.add(id, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func rejectLeaveRequest(id : Nat, comments : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (leaveRequests.get(id)) {
      case (null) { Runtime.trap("Leave request does not exist. ") };
      case (?request) {
        let updatedRequest = { request with status = #rejected; comments };
        leaveRequests.add(id, updatedRequest);
      };
    };
  };

  public query ({ caller }) func getLeaveRequestsByEmployee(employeeId : Nat) : async [LeaveRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only view their own leave requests
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?callerEmployeeId) {
          if (callerEmployeeId != employeeId) {
            Runtime.trap("Unauthorized: Staff can only view their own data");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    };

    leaveRequests.values().toArray().filter(func(l) { l.employeeId == employeeId });
  };

  public query ({ caller }) func getPendingLeaveRequests() : async [LeaveRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    leaveRequests.values().toArray().filter(func(l) { l.status == #pending });
  };

  // Payroll
  public shared ({ caller }) func addPayrollRecord(employeeId : Nat, month : Nat, year : Nat, basicSalary : Nat, allowances : Nat, deductions : Nat, netPay : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    let record : PayrollRecord = {
      employeeId;
      month;
      year;
      basicSalary;
      allowances;
      deductions;
      netPay;
    };
    payrollRecords.add(record);
  };

  public query ({ caller }) func getPayrollByEmployee(employeeId : Nat) : async [PayrollRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };

    // Staff can only view their own payroll records
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (getEmployeeIdForCaller(caller)) {
        case (?callerEmployeeId) {
          if (callerEmployeeId != employeeId) {
            Runtime.trap("Unauthorized: Staff can only view their own data");
          };
        };
        case (null) {
          Runtime.trap("Unauthorized: No employee profile associated with this user");
        };
      };
    };

    payrollRecords.filter(func(p) { p.employeeId == employeeId }).toArray();
  };

  public query ({ caller }) func getAllPayrollRecords() : async [PayrollRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    payrollRecords.toArray().sort();
  };

  // Dashboard Stats
  public query ({ caller }) func getStats() : async Stats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
    {
      totalEmployees = employees.size();
      departments = departments.size();
      pendingLeaveRequests = leaveRequests.values().toArray().filter(func(l) { l.status == #pending }).size();
    };
  };
};
