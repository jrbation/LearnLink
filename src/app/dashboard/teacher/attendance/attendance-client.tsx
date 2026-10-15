"use client";

import { useState } from "react";
import {
  UserCheck,
  CheckCircle2,
  Calendar,
  School,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  classes: any[];
}

export function TeacherAttendanceClient({ classes }: Props) {
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");

  const currentClass = classes.find((c) => c.id === selectedClassId);
  const schedules = currentClass?.schedules || [];

  const [selectedScheduleId, setSelectedScheduleId] = useState(
    schedules[0]?.id || ""
  );

  const currentSchedule = schedules.find((s: any) => s.id === selectedScheduleId);

  // Initialize attendance records from existing schedule attendance or default to PRESENT
  const initialRecords =
    currentClass?.enrollments.map((enr: any) => {
      const existing = currentSchedule?.attendance.find(
        (a: any) => a.studentId === enr.student.id
      );
      return {
        studentId: enr.student.id,
        studentName: enr.student.name,
        studentEmail: enr.student.email,
        status: existing?.status || "PRESENT",
        notes: existing?.notes || "",
      };
    }) || [];

  const [records, setRecords] = useState(initialRecords);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // When class changes
  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const cls = classes.find((c) => c.id === classId);
    const sch = cls?.schedules[0];
    setSelectedScheduleId(sch?.id || "");

    const newRecs =
      cls?.enrollments.map((enr: any) => {
        const existing = sch?.attendance.find(
          (a: any) => a.studentId === enr.student.id
        );
        return {
          studentId: enr.student.id,
          studentName: enr.student.name,
          studentEmail: enr.student.email,
          status: existing?.status || "PRESENT",
          notes: existing?.notes || "",
        };
      }) || [];

    setRecords(newRecs);
    setSuccessMessage(null);
  };

  // When schedule changes
  const handleScheduleChange = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    const sch = schedules.find((s: any) => s.id === scheduleId);

    const newRecs =
      currentClass?.enrollments.map((enr: any) => {
        const existing = sch?.attendance.find(
          (a: any) => a.studentId === enr.student.id
        );
        return {
          studentId: enr.student.id,
          studentName: enr.student.name,
          studentEmail: enr.student.email,
          status: existing?.status || "PRESENT",
          notes: existing?.notes || "",
        };
      }) || [];

    setRecords(newRecs);
    setSuccessMessage(null);
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords(
      records.map((r: any) =>
        r.studentId === studentId ? { ...r, status } : r
      )
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setRecords(
      records.map((r: any) =>
        r.studentId === studentId ? { ...r, notes } : r
      )
    );
  };

  const handleMarkAllPresent = () => {
    setRecords(records.map((r: any) => ({ ...r, status: "PRESENT" })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedScheduleId) {
      alert("Please select or create a scheduled session first.");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const payload = {
        scheduleId: selectedScheduleId,
        records: records.map((r: any) => ({
          studentId: r.studentId,
          status: r.status,
          notes: r.notes || undefined,
        })),
      };

      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to mark attendance");

      setSuccessMessage("Attendance recorded! Parents have been automatically alerted for absences/tardiness.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-primary-600" />
            Class Attendance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track student presence during remote classes. Parents receive instant notification if marked absent or late.
          </p>
        </div>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <School className="w-3.5 h-3.5 text-primary-600" />
            Select Class
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => handleClassChange(e.target.value)}
            className="input-field w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.subject})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary-600" />
            Select Scheduled Session
          </label>
          <select
            value={selectedScheduleId}
            onChange={(e) => handleScheduleChange(e.target.value)}
            className="input-field w-full text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200"
          >
            {schedules.length === 0 ? (
              <option value="">No scheduled sessions found for this class</option>
            ) : (
              schedules.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Student Attendance Roster ({records.length})
            </h3>
            <p className="text-xs text-slate-400">
              Click badges to set attendance status. Absent or Late records trigger parent notifications.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkAllPresent}
              className="btn-secondary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              disabled={isSubmitting || records.length === 0}
              className="btn-primary text-xs font-semibold px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="m-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </div>
        )}

        {records.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No enrolled students in this class.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record: any) => (
              <div
                key={record.studentId}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold text-xs flex items-center justify-center">
                    {record.studentName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{record.studentName}</h4>
                    <p className="text-[11px] text-slate-400">{record.studentEmail}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { key: "PRESENT", label: "Present", color: "bg-emerald-500 text-white" },
                    { key: "LATE", label: "Late", color: "bg-amber-500 text-white" },
                    { key: "ABSENT", label: "Absent", color: "bg-red-500 text-white" },
                    { key: "EXCUSED", label: "Excused", color: "bg-blue-500 text-white" },
                  ].map((statusItem) => {
                    const isSelected = record.status === statusItem.key;
                    return (
                      <button
                        key={statusItem.key}
                        onClick={() => handleStatusChange(record.studentId, statusItem.key)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                          isSelected
                            ? `${statusItem.color} shadow-xs scale-105`
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {statusItem.label}
                      </button>
                    );
                  })}

                  <input
                    type="text"
                    placeholder="Add note..."
                    value={record.notes}
                    onChange={(e) => handleNotesChange(record.studentId, e.target.value)}
                    className="input-field text-xs py-1 px-2.5 rounded-lg border border-slate-200 w-36"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
