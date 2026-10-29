"use client";
import { useEffect, useState } from "react";
import {
    LayoutDashboard,
    UsersRound,
    Building2,
    CalendarDays,
    CalendarClock,
    CalendarCheck,
    UserRound,
    LogOut,
    ClipboardList,
    Search,
    Check,
    X,
    RefreshCw
} from "lucide-react";
import "./dashboard.css";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState("Overview");
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardError, setDashboardError] = useState("");
    const [leaveData, setLeaveData] = useState([]);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [leaveError, setLeaveError] = useState("");
    const [leaveSearch, setLeaveSearch] = useState("");
    const [leaveFilter, setLeaveFilter] = useState("ALL");
    const [updatingLeaveId, setUpdatingLeaveId] = useState(null);
    const [leaveMessage, setLeaveMessage] = useState("");
    const [confirmLeave, setConfirmLeave] = useState(null);
    const [myLeaves, setMyLeaves] = useState([]);
    const [myLeavesLoading, setMyLeavesLoading] = useState(false);
    const [myLeavesError, setMyLeavesError] = useState("");
    const [myLeavesMessage, setMyLeavesMessage] = useState("");
    const [submittingLeave, setSubmittingLeave] = useState(false);
    const [leaveForm, setLeaveForm] = useState({leave_type: "Casual",start_date: "",end_date: ""});

    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
            window.location.replace("/");
            return;
        }
        try {
            setUser(JSON.parse(savedUser));
        } catch {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("/");
        }
    }, []);


    useEffect(() => {
        if (!user || activePage !== "Overview") {
            return;
        }

        const token = localStorage.getItem("token");

        async function loadDashboard() {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/dashboard/summary",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load dashboard data"
                    );
                }

                setDashboardData(data);
                setDashboardError("");
            } catch (error) {
                setDashboardError(
                    error.message || "Unable to load dashboard data"
                );
            }
        }

        loadDashboard();
    }, [user, activePage]);


    async function loadLeaveRequests() {
        const token = localStorage.getItem("token");

        setLeaveLoading(true);
        setLeaveError("");
        setLeaveMessage("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/leaves",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load leave requests"
                );
            }

            setLeaveData(data.leaves || []);
        } catch (error) {
            setLeaveError(
                error.message || "Unable to load leave requests"
            );
        } finally {
            setLeaveLoading(false);
        }
    }
    useEffect(() => {
        if (
            user &&
            user.role?.toLowerCase() === "employee" &&
            activePage === "My Leaves"
        ) {
            loadMyLeaves();
        }
    }, [user, activePage]);

    useEffect(() => {
        if (
            user &&
            user.role?.toLowerCase() === "admin" &&
            activePage === "Leave Requests"
        ) {
            loadLeaveRequests();
        }
    }, [user, activePage]);

    async function loadMyLeaves() {
        const token = localStorage.getItem("token");

        setMyLeavesLoading(true);
        setMyLeavesError("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/leaves/mine",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load your leave requests"
                );
            }

            setMyLeaves(data.leaves || []);
        } catch (error) {
            setMyLeavesError(
                error.message || "Unable to load your leave requests"
            );
        } finally {
            setMyLeavesLoading(false);
        }
    }

    async function handleLeaveSubmit(event) {
        event.preventDefault();

        if (leaveForm.end_date < leaveForm.start_date) {
            setMyLeavesError(
                "End date cannot be before the start date."
            );
            setMyLeavesMessage("");
            return;
        }

        const token = localStorage.getItem("token");

        setSubmittingLeave(true);
        setMyLeavesError("");
        setMyLeavesMessage("");

        try {
            const response = await fetch(
                "http://localhost:3000/api/leaves",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(leaveForm)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to submit your leave request"
                );
            }

            setLeaveForm({
                leave_type: "Casual",
                start_date: "",
                end_date: ""
            });

            setMyLeavesMessage(
                data.message || "Leave request submitted successfully."
            );

            await loadMyLeaves();

            setDashboardData((previousData) => {
                if (!previousData?.summary) {
                    return previousData;
                }

                return {
                    ...previousData,
                    summary: {
                        ...previousData.summary,
                        myLeaveRequests:
                            (previousData.summary.myLeaveRequests || 0) + 1,
                        myPendingLeaves:
                            (previousData.summary.myPendingLeaves || 0) + 1
                    }
                };
            });           
        } catch (error) {
            setMyLeavesError(
                error.message || "Unable to submit your leave request"
            );
        } finally {
            setSubmittingLeave(false);
        }
    }
    async function updateLeaveStatus(leaveId, status) {
        const token = localStorage.getItem("token");
        const currentLeave = leaveData.find(
            (leave) => leave.leave_id === leaveId
        );

        if (
            !currentLeave ||
            String(currentLeave.status).toUpperCase() !== "PENDING"
        ) {
            return false;
        }

        setUpdatingLeaveId(leaveId);
        setLeaveError("");
        setLeaveMessage("");

        try {
            const response = await fetch(
                `http://localhost:3000/api/leaves/${leaveId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ status })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to update leave status"
                );
            }

            setLeaveData((previousLeaves) =>
                previousLeaves.map((leave) =>
                    leave.leave_id === leaveId
                        ? data.leave
                        : leave
                )
            );

            setDashboardData((previousData) => {
                if (!previousData?.summary) {
                    return previousData;
                }

                const summary = { ...previousData.summary };

                summary.pendingLeaves = Math.max(
                    0,
                    (summary.pendingLeaves || 0) - 1
                );

                if (status === "APPROVED") {
                    summary.approvedLeaves =
                        (summary.approvedLeaves || 0) + 1;
                }

                const recentLeaves = (
                    previousData.recentLeaves || []
                ).map((leave) =>
                    leave.leave_id === leaveId
                        ? { ...leave, status }
                        : leave
                );

                return {
                    ...previousData,
                    summary,
                    recentLeaves
                };
            });

            setLeaveMessage(
                `Leave request ${status.toLowerCase()} successfully.`
            );

            return true;
        } catch (error) {
            setLeaveError(
                error.message || "Unable to update leave status"
            );

            return false;
        } finally {
            setUpdatingLeaveId(null);
        }
    }

    async function handleConfirmLeave() {
        if (!confirmLeave || updatingLeaveId !== null) {
            return;
        }

        const succeeded = await updateLeaveStatus(
            confirmLeave.id,
            confirmLeave.status
        );

        if (succeeded) {
            setConfirmLeave(null);
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/");
    }

    if (!user) {
        return (
            <main className="dashboard-loading">
                Loading dashboard...
            </main>
        );
    }

    const isAdmin = user.role?.toLowerCase() === "admin";

    const employeeMenu = [
        { name: "Overview", icon: LayoutDashboard },
        { name: "My Profile", icon: UserRound },
        { name: "My Leaves", icon: CalendarDays }
    ];

    const adminMenu = [
        { name: "Overview", icon: LayoutDashboard },
        { name: "Employees", icon: UsersRound },
        { name: "Departments", icon: Building2 },
        { name: "Leave Requests", icon: CalendarDays }
    ];

    const menuItems = isAdmin ? adminMenu : employeeMenu;

    function renderContent() {
        if (activePage === "Overview") {
            return (
                <>
                    <div className="page-heading">
                        <h1>Overview</h1>
                    </div>

                    <section className="summary-grid">
                        {isAdmin ? (
                            <>
                                <SummaryCard
                                    icon={UsersRound}
                                    label="Total Employees"
                                    value={
                                        dashboardData?.summary?.totalEmployees ?? "—"
                                    }
                                    description="Employee records"
                                />

                                <SummaryCard
                                    icon={Building2}
                                    label="Departments"
                                    value={
                                        dashboardData?.summary?.totalDepartments ?? "—"
                                    }
                                    description="Registered departments"
                                />

                                <SummaryCard
                                    icon={CalendarClock}
                                    label="Pending Leaves"
                                    value={
                                        dashboardData?.summary?.pendingLeaves ?? "—"
                                    }
                                    description="Awaiting approval"
                                />

                                <SummaryCard
                                    icon={CalendarCheck}
                                    label="Approved Leaves"
                                    value={
                                        dashboardData?.summary?.approvedLeaves ?? "—"
                                    }
                                    description="Approved requests"
                                />
                            </>
                        ) : (
                            <>
                                <SummaryCard
                                    icon={UserRound}
                                    label="My Profile"
                                    value={user.name || "Employee"}
                                    description="Your employee account"
                                    compact
                                />

                                <SummaryCard
                                    icon={CalendarDays}
                                    label="My Leave Requests"
                                    value={
                                        dashboardData?.summary?.myLeaveRequests ?? "—"
                                    }
                                    description="Requests submitted"
                                />

                                <SummaryCard
                                    icon={CalendarClock}
                                    label="Pending Requests"
                                    value={
                                        dashboardData?.summary?.myPendingLeaves ?? "—"
                                    }
                                    description="Awaiting approval"
                                />
                            </>
                        )}
                    </section>

                    <section className="content-card recent-card">
                        <div className="section-heading">
                            <div>
                                <h2>
                                    {isAdmin
                                        ? "Recent Leave Requests"
                                        : "My Recent Leave Requests"}
                                </h2>
                                <p>Latest submissions and their status.</p>
                            </div>
                        </div>

                        {dashboardError && (
                            <p className="dashboard-error">
                                {dashboardError}
                            </p>
                        )}

                        {!dashboardError && !dashboardData && (
                            <p className="dashboard-message">
                                Loading leave requests...
                            </p>
                        )}

                        {dashboardData &&
                            (dashboardData.recentLeaves || []).length === 0 && (
                                <div className="empty-state">
                                    <ClipboardList size={26} strokeWidth={1.6} />
                                    <h3>No leave requests yet</h3>
                                    <p>
                                        New leave applications will appear here.
                                    </p>
                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            setActivePage(
                                                isAdmin
                                                    ? "Leave Requests"
                                                    : "My Leaves"
                                            )
                                        }
                                    >
                                        {isAdmin
                                            ? "View Leave Requests"
                                            : "View My Leaves"}
                                    </button>
                                </div>
                            )}

                        {dashboardData &&
                            (dashboardData.recentLeaves || []).length > 0 && (
                                <div className="recent-leave-table-wrap">
                                    <table className="recent-leave-table">
                                        <thead>
                                            <tr>
                                                <th>Employee</th>
                                                <th>Department</th>
                                                <th>Leave Type</th>
                                                <th>Dates</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.recentLeaves.map(
                                                (leave) => (
                                                    <tr key={leave.leave_id}>
                                                        <td>
                                                            {leave.employee
                                                                ?.employee_name ||
                                                                "Employee"}
                                                        </td>
                                                        <td>
                                                            {leave.employee
                                                                ?.department
                                                                ?.department_name ||
                                                                "—"}
                                                        </td>
                                                        <td>{leave.leave_type}</td>
                                                        <td>
                                                            {leave.start_date} –{" "}
                                                            {leave.end_date}
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`leave-status leave-status-${String(
                                                                    leave.status
                                                                ).toLowerCase()}`}
                                                            >
                                                                {leave.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                    </section>
                </>
            );
        }

        if (activePage === "My Profile") {
            return (
                <>
                    <div className="page-heading">
                        <div>
                            <h1>My Profile</h1>
                            <p>View your employee information.</p>
                        </div>
                    </div>

                    <section className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2>{user.name}</h2>
                                <p>{user.email}</p>
                                <span className="role-badge">
                                    {user.role || "Employee"}
                                </span>
                            </div>
                        </div>

                        <div className="profile-details">
                            <Detail label="Full Name" value={user.name} />
                            <Detail label="Email Address" value={user.email} />
                            <Detail label="Role" value={user.role} />
                            <Detail
                                label="Department"
                                value={
                                    dashboardData?.employeeProfile?.department ||
                                    "Not linked"
                                }
                            />
                            <Detail
                                label="Employee ID"
                                value={
                                    dashboardData?.employeeProfile?.employee_id ||
                                    "Not linked"
                                }
                            />
                            <Detail
                                label="Joining Date"
                                value={
                                    dashboardData?.employeeProfile?.joining_date ||
                                    "Not available"
                                }
                            />
                        </div>
                    </section>
                </>
            );
        }

        if (activePage === "My Leaves") {
            return (
                <>
                    <div className="page-heading">
                        <div>
                            <h1>My Leaves</h1>
                            <p>Apply for leave and track your requests.</p>
                        </div>
                    </div>

                    <section className="content-card employee-leave-form-card">
                        <div className="employee-leave-section-heading">
                            <h2>Apply for Leave</h2>
                            <p>
                                Fill in the details to submit a leave request.
                            </p>
                        </div>

                        {myLeavesError && (
                            <p className="leave-alert leave-alert-error">
                                {myLeavesError}
                            </p>
                        )}

                        {myLeavesMessage && (
                            <p className="leave-alert leave-alert-success">
                                {myLeavesMessage}
                            </p>
                        )}

                        <form
                            className="employee-leave-form"
                            onSubmit={handleLeaveSubmit}
                        >
                            <div className="employee-leave-field">
                                <label htmlFor="leave_type">Leave Type</label>
                                <select
                                    id="leave_type"
                                    value={leaveForm.leave_type}
                                    onChange={(event) =>
                                        setLeaveForm((previous) => ({
                                            ...previous,
                                            leave_type: event.target.value
                                        }))
                                    }
                                    required
                                >
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Annual">Annual Leave</option>
                                    <option value="Personal">Personal Leave</option>
                                </select>
                            </div>

                            <div className="employee-leave-field">
                                <label htmlFor="start_date">Start Date</label>
                                <input
                                    id="start_date"
                                    type="date"
                                    value={leaveForm.start_date}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={(event) =>
                                        setLeaveForm((previous) => ({
                                            ...previous,
                                            start_date: event.target.value,
                                            end_date:
                                                previous.end_date &&
                                                previous.end_date < event.target.value
                                                    ? ""
                                                    : previous.end_date
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <div className="employee-leave-field">
                                <label htmlFor="end_date">End Date</label>
                                <input
                                    id="end_date"
                                    type="date"
                                    value={leaveForm.end_date}
                                    min={
                                        leaveForm.start_date ||
                                        new Date().toISOString().split("T")[0]
                                    }
                                    onChange={(event) =>
                                        setLeaveForm((previous) => ({
                                            ...previous,
                                            end_date: event.target.value
                                        }))
                                    }
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="employee-leave-submit"
                                disabled={submittingLeave}
                            >
                                {submittingLeave
                                    ? "Submitting..."
                                    : "Submit Leave Request"}
                            </button>
                        </form>
                    </section>

                    <section className="content-card employee-my-leaves-card">
                        <div className="employee-leave-section-heading employee-my-leaves-heading">
                            <div>
                                <h2>My Leave History</h2>
                                <p>
                                    {myLeaves.length} request
                                    {myLeaves.length === 1 ? "" : "s"} in total
                                </p>
                            </div>

                            <button
                                type="button"
                                className="leave-refresh-button"
                                onClick={loadMyLeaves}
                                disabled={myLeavesLoading}
                            >
                                <RefreshCw size={16} />
                                Refresh
                            </button>
                        </div>

                        {myLeavesLoading ? (
                            <p className="dashboard-message">
                                Loading your leave requests...
                            </p>
                        ) : (
                            <div className="recent-leave-table-wrap">
                                <table className="recent-leave-table">
                                    <thead>
                                        <tr>
                                            <th>Leave Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {myLeaves.map((leave) => (
                                            <tr key={leave.leave_id}>
                                                <td>{leave.leave_type}</td>
                                                <td>{leave.start_date}</td>
                                                <td>{leave.end_date}</td>
                                                <td>
                                                    <span
                                                        className={`leave-status leave-status-${String(
                                                            leave.status
                                                        ).toLowerCase()}`}
                                                    >
                                                        {leave.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}

                                        {myLeaves.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="leave-empty-cell"
                                                >
                                                    You haven't submitted any leave
                                                    requests yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            );
        }

        if (isAdmin && activePage === "Leave Requests") {
            const filteredLeaves = leaveData.filter((leave) => {
                const searchText = leaveSearch.trim().toLowerCase();

                const employeeName =
                    leave.employee?.employee_name || "Employee";

                const department =
                    leave.employee?.department?.department_name || "";

                const matchesSearch = [
                    employeeName,
                    leave.employee?.email || "",
                    department,
                    leave.leave_type,
                    leave.start_date,
                    leave.end_date
                ].some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(searchText)
                );

                const matchesStatus =
                    leaveFilter === "ALL" ||
                    String(leave.status).toUpperCase() === leaveFilter;

                return matchesSearch && matchesStatus;
            });

            return (
                <>
                    <div className="page-heading">
                        <div>
                            <h1>Leave Requests</h1>
                            <p>
                                Review and manage employee leave applications.
                            </p>
                        </div>
                    </div>

                    <section className="leave-toolbar">
                        <div className="leave-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search employee, department or leave type..."
                                value={leaveSearch}
                                onChange={(event) =>
                                    setLeaveSearch(event.target.value)
                                }
                            />
                        </div>

                        <select
                            className="leave-filter"
                            value={leaveFilter}
                            onChange={(event) =>
                                setLeaveFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <button
                            className="leave-refresh-button"
                            onClick={loadLeaveRequests}
                            disabled={leaveLoading}
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </section>

                    {leaveError && (
                        <p className="leave-alert leave-alert-error">
                            {leaveError}
                        </p>
                    )}

                    {leaveMessage && (
                        <p className="leave-alert leave-alert-success">
                            {leaveMessage}
                        </p>
                    )}

                    <section className="content-card leave-table-card">
                        <div className="leave-table-heading">
                            <div>
                                <h2>All Leave Requests</h2>
                                <p>
                                    {filteredLeaves.length} request
                                    {filteredLeaves.length === 1 ? "" : "s"} found
                                </p>
                            </div>
                        </div>

                        {leaveLoading ? (
                            <p className="dashboard-message">
                                Loading leave requests...
                            </p>
                        ) : (
                            <div className="recent-leave-table-wrap">
                                <table className="recent-leave-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Department</th>
                                            <th>Leave Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredLeaves.map((leave) => (
                                            <tr key={leave.leave_id}>
                                                <td>
                                                    <strong>
                                                        {leave.employee
                                                            ?.employee_name ||
                                                            "Employee"}
                                                    </strong>
                                                    <span className="leave-employee-email">
                                                        {leave.employee?.email ||
                                                            "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {leave.employee?.department
                                                        ?.department_name || "—"}
                                                </td>

                                                <td>{leave.leave_type}</td>
                                                <td>{leave.start_date}</td>
                                                <td>{leave.end_date}</td>

                                                <td>
                                                    <span
                                                        className={`leave-status leave-status-${String(
                                                            leave.status
                                                        ).toLowerCase()}`}
                                                    >
                                                        {leave.status}
                                                    </span>
                                                </td>

                                                <td>
                                                    {String(leave.status).toUpperCase() ===
                                                    "PENDING" ? (
                                                        <div className="leave-actions">
                                                            <button
                                                                className="leave-approve-button"
                                                                disabled={
                                                                    updatingLeaveId !==
                                                                    null
                                                                }
                                                                onClick={() =>
                                                                    setConfirmLeave({
                                                                        id: leave.leave_id,
                                                                        status: "APPROVED",
                                                                        employee:
                                                                            leave.employee
                                                                                ?.employee_name ||
                                                                            "this employee"
                                                                    })
                                                                }
                                                            >
                                                                <Check size={16} />
                                                                Approve
                                                            </button>

                                                            <button
                                                                className="leave-reject-button"
                                                                disabled={
                                                                    updatingLeaveId !==
                                                                    null
                                                                }
                                                                onClick={() =>
                                                                    setConfirmLeave({
                                                                        id: leave.leave_id,
                                                                        status: "REJECTED",
                                                                        employee:
                                                                            leave.employee
                                                                                ?.employee_name ||
                                                                            "this employee"
                                                                    })
                                                                }
                                                            >
                                                                <X size={16} />
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="leave-action-complete">
                                                            No action needed
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredLeaves.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="leave-empty-cell"
                                                >
                                                    {leaveData.length > 0
                                                        ? "No requests match your search or filter."
                                                        : "No leave requests found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </>
            );
        }

        if (isAdmin) {
            const pageDetails = {
                Employees: {
                    description: "View and manage employee records.",
                    message: "Employee management will be available here."
                },
                Departments: {
                    description: "View your organization's departments.",
                    message: "Department management will be available here."
                }
            };

            const details = pageDetails[activePage];

            if (details) {
                return (
                    <PlaceholderPage
                        title={activePage}
                        description={details.description}
                        message={details.message}
                    />
                );
            }
        }

        return null;
    }

    return (
        <main className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <UsersRound size={23} />
                    </div>
                    <div>
                        <h2>Employee Directory</h2>
                        <p>Management Portal</p>
                    </div>
                </div>

                <div className="sidebar-section-label">MAIN MENU</div>

                <nav className="sidebar-navigation">
                    {menuItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.name}
                                className={`sidebar-link ${
                                    activePage === item.name ? "active" : ""
                                }`}
                                onClick={() => setActivePage(item.name)}
                            >
                                <Icon size={19} strokeWidth={1.8} />
                                <span>{item.name}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        <LogOut size={19} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            <section className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="topbar-context">
                        <span>WORKSPACE</span>
                    </div>

                    <div className="topbar-user">
                        <div className="topbar-user-info">
                            <strong>{user.name}</strong>
                            <span>
                                {isAdmin ? "Administrator" : "Employee"}
                            </span>
                        </div>
                        <div className="topbar-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    {renderContent()}
                </div>
            </section>

            {confirmLeave && (
                <div
                    className="leave-modal-overlay"
                    onClick={() => {
                        if (updatingLeaveId === null) {
                            setConfirmLeave(null);
                        }
                    }}
                >
                    <section
                        className="leave-confirm-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="leave-confirm-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div
                            className={`leave-confirm-icon ${
                                confirmLeave.status === "APPROVED"
                                    ? "confirm-approve-icon"
                                    : "confirm-reject-icon"
                            }`}
                        >
                            {confirmLeave.status === "APPROVED" ? (
                                <Check size={24} />
                            ) : (
                                <X size={24} />
                            )}
                        </div>

                        <h2 id="leave-confirm-title">
                            {confirmLeave.status === "APPROVED"
                                ? "Approve Leave Request?"
                                : "Reject Leave Request?"}
                        </h2>

                        <p>
                            Are you sure you want to{" "}
                            {confirmLeave.status === "APPROVED"
                                ? "approve"
                                : "reject"}{" "}
                            the leave request from{" "}
                            <strong>{confirmLeave.employee}</strong>?
                        </p>

                        <div className="leave-confirm-actions">
                            <button
                                type="button"
                                className="leave-cancel-button"
                                disabled={updatingLeaveId !== null}
                                onClick={() => setConfirmLeave(null)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={
                                    confirmLeave.status === "APPROVED"
                                        ? "leave-confirm-approve"
                                        : "leave-confirm-reject"
                                }
                                disabled={updatingLeaveId !== null}
                                onClick={handleConfirmLeave}
                            >
                                {updatingLeaveId === confirmLeave.id
                                    ? "Processing..."
                                    : confirmLeave.status === "APPROVED"
                                        ? "Yes, Approve"
                                        : "Yes, Reject"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    compact = false
}) {
    return (
        <article className="summary-card">
            <div className="summary-icon">
                <Icon size={22} strokeWidth={1.8} />
            </div>
            <p>{label}</p>
            <h2 className={compact ? "summary-value-compact" : ""}>
                {value}
            </h2>
            <span>{description}</span>
        </article>
    );
}

function Detail({ label, value }) {
    return (
        <div className="detail-item">
            <span>{label}</span>
            <strong>{value || "Not available"}</strong>
        </div>
    );
}

function PlaceholderPage({ title, description, message }) {
    return (
        <>
            <div className="page-heading">
                <div>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            </div>

            <section className="content-card empty-page-card">
                <ClipboardList
                    size={34}
                    strokeWidth={1.6}
                    className="empty-page-icon"
                />
                <h2>{title}</h2>
                <p>{message}</p>
            </section>
        </>
    );
}