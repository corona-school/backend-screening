import {Student} from '../database/models/Student';
import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();
const apiUri = process.env.CORONA_BACKEND_API_URL;
const apiToken = process.env.CORONA_BACKEND_API_TOKEN;
axios.defaults.headers.common['Token'] = apiToken;

export default class BackendApiService {

  getStudent = async (email: string): Promise<Student> => {
    return new Promise((resolve, reject) => {
      // TODO: Question: how to set (or not set) verified property (verified or presence of screening)?
      axios
          .get(apiUri + email)
          // TODO: types for data?
          .then(({status, data}) => {
            if (status == 200) {
              if (data) {
                // TODO: if property names where identical, we could do this with a simple Object.assign
                const student = new Student();
                student.firstname = data.firstName;
                student.lastname = data.lastName;
                student.email = data.email;
                student.verified = data.verified;
                student.subjects = data.subjects;
                student.phone = data.phone;
                student.birthday = data.birthday;
                student.msg = data.msg;
                resolve(student);
              }
              reject("API response missing student data");
            }
            reject("API non-200 return code");
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
            }
            reject("Could not find student");
          })
          .catch((err) => {
            reject(err);
          });
    });
  };

  updateStudent = async (student: Student): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // TODO: send to api
            reject("WIP not sending data yet");
    });
  };
}
