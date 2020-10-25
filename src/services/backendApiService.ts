import axios from "axios";
import { Screener, ScreenerRequest, IRawScreener } from "../types/Screener";
import {
  Student,
  IRawStudent,
  IRawStudent2,
  SearchStudent,
  ApiScreeningResult,
  ScreeningStatus,
  Screening,
} from "../types/Student";
import { IStudentScreeningResult } from "../types/StudentScreeningResult";
import LoggerService from "../utils/Logger";
import { Course } from "../types/Course";
import { ApiCourseUpdate } from "../types/Course";
const Logger = LoggerService("backendApiService.ts");

const API = process.env.CORONA_BACKEND_API_URL;
const apiUriStudent = API + "student/";
const apiUriScreener = API + "screener/";
const apiToken = process.env.CORONA_BACKEND_API_TOKEN;
axios.defaults.headers.common["Token"] = apiToken;

function IsScreened(student: IRawStudent) {
  let isScreened = false;

  if (student.isTutor) {
    isScreened = student.screenings.tutor !== undefined;
  }
  if (student.isInstructor) {
    isScreened = isScreened || student.screenings.instructor !== undefined;
  }
  if (student.isProjectCoach) {
    isScreened = isScreened || student.screenings.projectCoach !== undefined;
  }

  return isScreened;
}

export const apiService = {
  async getStudent(email: string): Promise<IRawStudent> {
    try {
      const {
        status,

        data,
      }: { status: number; data: IRawStudent } = await axios.get(
        `${API}student/${email}`
      );

      console.log(data);

      if (status !== 200)
        throw "Get student response with non-200 return code: " + status;

      if (!data || !data.email)
        throw "Get student response with missing or invalid student data";

      console.log("getStudent():", data);

      return data;
    } catch (error) {
      Logger.error("Get student data failed: ", error);
      throw error;
    }
  },
  async getAllStudents(): Promise<SearchStudent[]> {
    try {
      const {
        status,
        data,
      }: { status: number; data: IRawStudent2[] } = await axios.get(
        `${API}student`
      );
      if (status !== 200)
        throw "Get all students response with non-200 return code: " + status;

      if (!data)
        throw "Get all students response with missing or invalid student data";

      const students: SearchStudent[] = data.map((s) => ({
        firstname: s.firstname,
        lastname: s.lastname,
        email: s.email,
      }));

      return students;
    } catch (error) {
      Logger.error("Get all students data failed: ", error);
      throw error;
    }
  },

  async getUnverifiedStudent(email: string): Promise<IRawStudent> {
    const student = await apiService.getStudent(email);

    if (IsScreened(student)) throw "Student is already verified";

    return student;
  },

  async updateStudent(
    studentScreeningResult: IStudentScreeningResult,
    studentEmail: string
  ): Promise<boolean> {
    try {
      const { status } = await axios.put(
        `${API}student/${studentEmail}`,
        studentScreeningResult
      );

      if (status !== 200)
        throw "Student data could not be saved in our database.";

      return true;
    } catch (error) {
      Logger.error("Update student data failed: ", error);
      throw error;
    }
  },
  async getScreener(email: string, includePassword = false): Promise<Screener> {
    try {
      const {
        status,
        data,
      }: { status: number; data: IRawScreener } = await axios.get(
        `${API}screener/${email}/${includePassword}`
      );

      if (status !== 200)
        throw "Get screener response with non-200 return code: " + status;

      if (!data || !data.email)
        throw "Get screener response with missing or invalid screener data";

      const screener: Screener = {
        id: data.id,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.passwordHash,
        verified: data.verified,
        active: data.active,
      };

      return screener;
    } catch (error) {
      Logger.error("Get screener data failed: ", error);
      throw error;
    }
  },
  async getVerifiedScreener(
    email: string,
    includePassword: boolean
  ): Promise<Screener> {
    const screener = await apiService.getScreener(email, includePassword);

    if (screener.verified && screener.active) {
      return screener;
    } else {
      throw "Screener is not verified";
    }
  },

  async createScreener(screener: ScreenerRequest): Promise<boolean> {
    try {
      const { status } = await axios.post(apiUriScreener, screener);

      if (status !== 200)
        throw "Create screener response with non-200 return code: " + status;

      return true;
    } catch (error) {
      Logger.error(
        "Create screener failed: {} (status {})",
        error.response.data,
        error.response.status
      );
      throw error;
    }
  },

  async getCourses(search?: string, courseState?: string): Promise<Course[]> {
    try {
      const { status, data } = await axios.get(`${API}courses`, {
        params: { search, courseState },
      });
      if (status !== 200)
        throw "Retrieving courses responded with non 200 return code " + status;

      return data.courses;
    } catch (error) {
      Logger.error("getCourses failed with", error);
      throw error;
    }
  },

  async updateCourse(
    id: string | number,
    update: ApiCourseUpdate
  ): Promise<Course> {
    try {
      const { status, data } = await axios.post(
        `${API}course/${id}/update`,
        update
      );

      if (status !== 200) throw "updating course failed with code " + status;

      return data.course;
    } catch (error) {
      Logger.error("updateCourse failed with", error);
      throw error;
    }
  },

  async getInstructors(
    screeningStatus:
      | ScreeningStatus.Accepted
      | ScreeningStatus.Rejected
      | ScreeningStatus.Unscreened,
    search: string
  ): Promise<Array<Student & { __screening__: Screening }>> {
    try {
      const { status, data } = await axios.get(`${API}instructors`, {
        params: { screeningStatus, search },
      });
      if (status !== 200)
        throw "Retrieving courses responded with non 200 return code " + status;

      return data.instructors;
    } catch (error) {
      Logger.error("getCourses failed with", error);
      throw error;
    }
  },

  async updateInstructor(
    id: string | number,
    update: ApiScreeningResult
  ): Promise<{ instructor: any }> {
    try {
      const { status, data } = await axios.post(
        `${API}instructor/${id}/update`,
        update
      );

      if (status !== 200) throw "updating course failed with code " + status;

      return data;
    } catch (error) {
      Logger.error("updateCourse failed with", error);
      throw error;
    }
  },
};
