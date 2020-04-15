import {Student} from '../database/models/Student';
import axios from 'axios';
import dotenv from "dotenv";
import {StudentScreeningResult} from '../controller/dto/StudentScreeningResult';
dotenv.config();
const apiUri = process.env.CORONA_BACKEND_API_URL;
const apiToken = process.env.CORONA_BACKEND_API_TOKEN;
axios.defaults.headers.common['Token'] = apiToken;

export default class BackendApiService {

  getStudent = async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      axios
          .get(apiUri + email)
          .then(({status, data}) => {
            if (status == 200) {
              if (data && data.email) {
                // TODO: if property names where identical, we could do this with a simple Object.assign
                const student = new Student();
                student.firstname = data.firstName;
                student.lastname = data.lastName;
                student.email = data.email;
                student.verified = data.alreadyScreened == false ? undefined : data.verified;
                student.subjects = data.subjects;
                student.phone = data.phone;
                student.birthday = data.birthday;
                student.msg = data.msg;
                resolve(student);
              } else {
                reject("API response with missing or invalid student data");
              }
            } else {
              reject("API non-200 return code: " + status);
            }
          })
          .catch((err) => {
            console.error("Get student data failed: ", err);
            reject(err);
          });
    });
  };

  getUnverifiedStudent = async (email: string): Promise<Student> => {
    // TODO: s.a.
    return new Promise((resolve, reject) => {
      this.getStudent(email)
          .then((student) => {
            if (student && !student.verified) {
              resolve(student);
            } else {
              reject("Could not find student");
            }
          })
          .catch((err) => {
            reject(err);
          });
    });
  };

  updateStudent = async (studentScreeningResult: StudentScreeningResult): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      axios
          .put(apiUri + studentScreeningResult.email, studentScreeningResult)
          .then(({status, data}) => {
            if (status == 200) {
              resolve(true);
            } else {
              reject("API non-200 return code: " + status);
            }
          })
          .catch((err) => {
            console.error("update student data failed: ", err);
            reject(err);
          });
    });
  };
}


