/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Model,
  Table,
  Column,
  BeforeUpdate,
  HasMany,
  BeforeCreate,
  DefaultScope,
  Scopes,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import QueueLog from "./QueueLog";

@DefaultScope(() => ({
  attributes: ["id", "firstname", "lastname", "email"],
}))
@Scopes(() => ({
  full: {
    attributes: ["id", "firstname", "lastname", "email", "password"],
  },
  view: {
    attributes: ["id", "firstname", "lastname", "email"],
  },
}))
@Table({
  timestamps: false,
  tableName: "screener",
})
export class Screener extends Model<Screener> {
  @Column({ autoIncrement: true, primaryKey: true }) id: number;
  @Column({ field: "vorname" }) firstname: string;
  @Column({ field: "nachname" }) lastname: string;
  @Column
  email: string;

  @Column({ field: "passwort" }) password: string;
  @Column verified: boolean;
  @HasMany(() => QueueLog, { sourceKey: "email" }) queueLogs: QueueLog[];
  @Column active: boolean;

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

export const getVerifiedScreenerWithPassword = async (
  email: string
): Promise<Screener> => {
  return new Promise((resolve, reject) => {
    Screener.scope("full")
      .findOne({
        where: {
          email,
          verified: true,
        },
      })
      .then((screener) => {
        console.log(screener.password);

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
