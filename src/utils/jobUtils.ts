import crypto from "crypto";
import { StudentData, Status, ScreeningType } from "../types/Queue";
import { IRawStudent } from "../types/Student";
import { IStudentScreeningResult } from "../types/StudentScreeningResult";

export const getId = (email: string) =>
  crypto.createHash("md5").update(email).digest("hex");

const getScreeningType = (student: IRawStudent): ScreeningType[] => {
  const screenings: ScreeningType[] = [];

  if (student.isInstructor && student.screenings.instructor === undefined) {
    screenings.push(student.official ? "intern" : "instructor");
  }
  if (student.isTutor && student.screenings.tutor === undefined) {
    screenings.push("tutor");
  }
  if (student.isProjectCoach && student.screenings.projectCoach === undefined) {
    screenings.push("projectCoach");
  }
  return screenings;
};

export const createJob = (id: string, student: IRawStudent): StudentData => {
  const subjects = student.subjects.map((s) => ({
    name: s.name,
    grade: { min: s.grade?.min || 1, max: s.grade?.max || 13 },
  }));

  const projectFields = student.projectFields.map((f) => ({
    name: f.name,
    min: f.min || 1,
    max: f.max || 13,
  }));

  const screeningTypes = getScreeningType(student);

  return {
    id,
    ...student,
    subjects,
    projectFields,
    jitsi: `https://meet.jit.si/${id}`,
    screeningTypes,
  };
};

export const updateJob = (
  oldData: StudentData,
  newData: StudentData
): StudentData => {
  return {
    ...oldData,
    ...newData,
  };
};

export const getScreeningResult = (
  studentData: StudentData,
  screenerEmail: string
): IStudentScreeningResult => {
  return {
    screenerEmail,
    email: studentData.email,
    isTutor: studentData.isTutor,
    isInstructor: studentData.isInstructor,
    isProjectCoach: studentData.isProjectCoach,
    screenings: {
      tutor: studentData.screenings.tutor,
      instructor: studentData.screenings.instructor,
      projectCoach: studentData.screenings.projectCoach,
    },
    projectFields: studentData.projectFields,
    subjects: studentData.subjects,
    feedback: studentData.feedback,
    phone: studentData.phone,
    newsletter: studentData.newsletter,
    msg: studentData.msg,
    university: studentData.university,
    state: studentData.state,
    isUniversityStudent: studentData.isUniversityStudent,
    jufoPastParticipationConfirmed: studentData.jufoPastParticipationConfirmed,
    wasJufoParticipant: studentData.wasJufoParticipant,
    hasJufoCertificate: studentData.hasJufoCertificate,
    jufoPastParticipationInfo: studentData.jufoPastParticipationInfo,
    official: studentData.official,
    verifiedAt: studentData.verifiedAt,
  };
};

export const isValidStatusChange = (
  oldStatus: Status,
  newStatus: Status
): boolean => {
  if (oldStatus === "active" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "completed" && newStatus === "active") {
    return false;
  }
  if (oldStatus === "rejected" && newStatus === "active") {
    return false;
  }
  if (oldStatus === "completed" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "rejected" && newStatus === "waiting") {
    return false;
  }
  if (oldStatus === "waiting" && newStatus === "completed") {
    return false;
  }

  return true;
};

export const isValidScreenerChange = (
  oldJob: Partial<StudentData>,
  newJob: StudentData
) => {
  // if (!oldJob.screener) {
  // 	return true;
  // }
  // if (!newJob.screener) {
  // 	return false;
  // }
  // if (oldJob.screener.email === newJob.screener.email) {
  // 	return true;
  // }
  // if (oldJob.status !== "waiting" || newJob.status !== "waiting") {
  // 	return false;
  // }

  return true;
};
