import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
})
export class Student extends Model<Student> {
  @Column firstname: string;
  @Column lastname: string;
  @Column({ primaryKey: true }) email: string;
  @Column verified: boolean;
  @Column subjects: string;
  @Column phone: string;
  @Column birthday: Date;
  @Column msg: string;
  @Column screener: string;
  @Column invited: boolean;
  @Column feedback: string;
  @Column({ field: "comment_screener" }) commentScreener: string;
  @Column({ field: "knowcsfrom" }) knowsUsFrom: string;
}

export const getUnverifiedStudent = async (email: string): Promise<Student> => {
  return new Promise((resolve, reject) => {
    Student.findOne({
      where: {
        email,
        verified: false,
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
