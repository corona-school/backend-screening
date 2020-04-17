import axios from 'axios';
import dotenv from "dotenv";

import { Student } from '../database/models/Student';
import { StudentScreeningResult } from '../controller/dto/StudentScreeningResult';
import { Screener } from '../database/models/Screener';

dotenv.config();
const apiUriStudent = process.env.CORONA_BACKEND_API_URL + 'student/';
const apiUriScreener = process.env.CORONA_BACKEND_API_URL + 'screener/';
const apiToken = process.env.CORONA_BACKEND_API_TOKEN;
axios.defaults.headers.common['Token'] = apiToken;

export default class BackendApiService {

  getStudent = async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      axios
          .get(apiUriStudent + email)
          .then(({status, data}) => {
            if (status == 200) {
              if (data && data.email) {
                const student = new Student();
                student.firstname = data.firstName;
                student.lastname = data.lastName;
                student.email = data.email;
                student.verified = data.alreadyScreened === false ? undefined : data.verified;
                student.subjects = data.subjects;
                student.phone = data.phone;
                student.birthday = data.birthday;
                student.msg = data.msg;
                resolve(student);
              } else {
                reject("Get student response with missing or invalid student data");
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
  };

  getUnverifiedStudent = async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      this.getStudent(email)
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
  };

  updateStudent = async (studentScreeningResult: StudentScreeningResult, studentEmail: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      axios
          .put(apiUriStudent + studentEmail, studentScreeningResult)
          .then(({status, data}) => {
            if (status == 200) {
              resolve(true);
            } else {
              reject("Update student response with non-200 return code: " + status);
            }
          })
          .catch((err) => {
            console.error("Update student data failed: ", err);
            reject(err);
          });
    });
  };

  getScreener = async (email: string, includePassword: boolean): Promise<Screener> => {
    return new Promise((resolve, reject) => {
      axios
          .get(apiUriScreener + email + '/' + includePassword)
          .then(({status, data}) => {
            if (status == 200) {
              if (data && data.email) {
                const screener = new Screener();
                screener.id = data.id;
                screener.firstname = data.firstname;
                screener.lastname = data.lastname;
                screener.email = data.email;
                if (includePassword) {
                  screener.password = data.passwordHash;
                }
                screener.verified = data.verified;
                screener.active =data.active;
                resolve(screener);
              } else {
                reject("Get screener response with missing or invalid screener data");
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
  };

  getVerifiedScreener = async (email: string, includePassword: boolean): Promise<Screener> => {
    return new Promise((resolve, reject) => {
      this.getScreener(email, includePassword)
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
  };

  createScreener = async (screener: Screener): Promise<boolean> => {
    await Screener.hashPassword(screener);

    return new Promise((resolve, reject) => {
      const screenerDTO = {
        firstname: screener.firstname,
        lastname: screener.lastname,
        email: screener.email,
        verified: false,
        passwordHash: screener.password,
        active: false

    };
      axios
          .post(apiUriScreener, screener)
          .then(({status, data}) => {
            if (status == 200) {
              resolve(true);
            } else {
              reject("Create screener response with non-200 return code: " + status);
            }
          })
          .catch((err) => {
            console.error("Create screener failed: {} (status {})", err.response.data, err.response.status);
            reject(err);
          });
    });
  };
}


