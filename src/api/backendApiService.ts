/* eslint-disable @typescript-eslint/interface-name-prefix */
import axios from "axios";
import { Screener, ScreenerRequest, IRawScreener } from "../models/Screener";
import { Student, IRawStudent } from "../models/Student";
import { IStudentScreeningResult } from "../models/StudentScreeningResult";

const apiUriStudent = process.env.CORONA_BACKEND_API_URL + "student/";
const apiUriScreener = process.env.CORONA_BACKEND_API_URL + "screener/";
const apiToken = process.env.CORONA_BACKEND_API_TOKEN;
axios.defaults.headers.common["Token"] = apiToken;

export const apiService = {
  getStudent: async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      axios
        .get(apiUriStudent + email)
        .then(({ status, data }: { status: number; data: IRawStudent }) => {
          if (status == 200) {
            if (data && data.email) {
              const student: Student = {
                firstname: data.firstName,
                lastname: data.lastName,
                email: data.email,
                verified:
                  data.alreadyScreened === false ? undefined : data.verified,
                subjects: data.subjects,
                phone: data.phone,
                birthday: data.birthday,
                msg: data.msg,
              };

              resolve(student);
            } else {
              reject(
                "Get student response with missing or invalid student data"
              );
            }
          } else {
            reject("Get student response with non-200 return code: " + status);
          }
        })
        .catch((err) => {
          console.error("Get student data failed: ", err);
          reject(err);
        });
    });
  },

  getUnverifiedStudent: async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      apiService
        .getStudent(email)
        .then((student) => {
          if (student.verified == null) {
            resolve(student);
          } else {
            reject("Student is already verified");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  updateStudent: async (
    studentScreeningResult: IStudentScreeningResult,
    studentEmail: string
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      axios
        .put(apiUriStudent + studentEmail, studentScreeningResult)
        .then(({ status, data }) => {
          if (status == 200) {
            resolve(true);
          } else {
            reject(
              "Update student response with non-200 return code: " + status
            );
          }
        })
        .catch((err) => {
          console.error("Update student data failed: ", err);
          reject(err);
        });
    });
  },
  getScreener: (email: string, includePassword = false): Promise<Screener> => {
    return new Promise((resolve, reject) => {
      axios
        .get(apiUriScreener + email + "/" + includePassword)
        .then(({ status, data }: { status: number; data: IRawScreener }) => {
          if (status == 200) {
            if (data && data.email) {
              const screener: Screener = {
                id: data.id,
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                password: data.passwordHash,
                verified: data.verified,
                active: data.active,
              };

              resolve(screener);
            } else {
              reject(
                "Get screener response with missing or invalid screener data"
              );
            }
          } else {
            reject("Get screener response with non-200 return code: " + status);
          }
        })
        .catch((err) => {
          console.error("Get screener data failed: ", err);
          reject(err);
        });
    });
  },
  getVerifiedScreener: async (
    email: string,
    includePassword: boolean
  ): Promise<Screener> => {
    return new Promise((resolve, reject) => {
      apiService
        .getScreener(email, includePassword)
        .then((screener) => {
          if (screener.verified && screener.active) {
            resolve(screener);
          } else {
            reject("Screener is not verified");
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  createScreener: (screener: ScreenerRequest): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      axios
        .post(apiUriScreener, screener)
        .then(({ status, data }) => {
          if (status == 200) {
            resolve(true);
          } else {
            reject(
              "Create screener response with non-200 return code: " + status
            );
          }
        })
        .catch((err) => {
          console.error(
            "Create screener failed: {} (status {})",
            err.response.data,
            err.response.status
          );
          reject(err);
        });
    });
  },
};
