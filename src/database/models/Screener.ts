import {
  Model,
  Table,
  Column,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import bcrypt from "bcrypt";

@Table({
  timestamps: false,
  tableName: "screener",
})
export class Screener extends Model<Screener> {
  @Column({ autoIncrement: true, primaryKey: true }) id: number; //Person.id
  @Column({ field: "vorname" }) firstname: string; //Person.firstname
  @Column({ field: "nachname" }) lastname: string; //Person.lastname
  @Column email: string; //Person.email
  @Column({ field: "passwort" }) password: string; //Screener.password
  @Column verified: boolean;

  @BeforeUpdate
  @BeforeCreate
  static async hashPassword(screener: Screener): Promise<void> {
    screener.password = await bcrypt.hash(
      screener.password,
      bcrypt.genSaltSync(8)
    );
  }
}

export const getVerifiedScreener = async (email: string): Promise<Screener> => {
  return new Promise((resolve, reject) => {
    Screener.findOne({
      where: {
        email,
        verified: true,
      },
    })
      .then((screener) => {
        if (screener) {
          resolve(screener);
        }
        reject("Could not find screener");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getScreener = async (email: string): Promise<Screener> => {
  return new Promise((resolve, reject) => {
    Screener.findOne({
      where: {
        email,
      },
    })
      .then((screener) => {
        if (screener) {
          resolve(screener);
        }
        reject("Could not find screener");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
