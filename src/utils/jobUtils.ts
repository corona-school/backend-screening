import { Student } from "../database/models/Student";
import { Job } from "../queue";

export const createJob = (student: Student): Job => {
	return {
		firstname: student.firstname,
		lastname: student.lastname,
		email: student.email,
		time: Date.now(),
		jitsi: `https://meet.jit.si/${student.firstname}_${
			student.lastname
		}_${Date.now()}`,
		status: "waiting"
	};
};
