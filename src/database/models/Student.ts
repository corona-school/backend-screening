import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
})
export class Student extends Model<Student> {
  @Column firstname: string; //Person.firstname
  @Column lastname: string; //Person.lastname
  @Column({ primaryKey: true }) email: string; //Person.email
  @Column verified: boolean; //Student.screening(.success)
  @Column subjects: string; //Student.subjects
  @Column phone: string; //Student.phone
  @Column birthday: Date; //Student.birthday
  @Column msg: string; //Student.msg
  @Column screener: string; //Student.screening.screener(.id?)
  @Column invited: boolean; //?
  @Column feedback: string;//?
  @Column({ field: "comment_screener" }) commentScreener: string; //Student.screening.comment
  @Column({ field: "knowcsfrom" }) knowsUsFrom: string; //Student.screening.knowsCoronaSchoolFrom
}

export const getUnverifiedStudent = async (email: string): Promise<Student> => {
  // ToDo: use getStudent and filter by ???
  return new Promise((resolve, reject) => {
    Student.findOne({
      where: {
        email,
        verified: null,
      },
    })
      .then((student) => {
        if (student) {
          resolve(student);
        }
        reject("Could not find student");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getStudent = async (email: string): Promise<Student> => {
  return new Promise((resolve, reject) => {
    // ToDo: grab Student data from api, map if object found Question: how to set (or not set) verified property
    Student.findOne({
      where: {
        email,
      },
    })
      .then((student) => {
        if (student) {
          resolve(student);
        }
        reject("Could not find student");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
