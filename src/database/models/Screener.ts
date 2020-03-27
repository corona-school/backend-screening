import {
  Model,
  Table,
  Column,
  AutoIncrement,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import bcrypt from "bcrypt";

@Table({
  timestamps: false,
  tableName: "screener",
})
export class Screener extends Model<Screener> {
  @AutoIncrement @Column({ primaryKey: true }) id: number;
  @Column({ field: "vorname" }) firstname: string;
  @Column({ field: "nachname" }) lastname: string;
  @Column email: string;
  @Column({ field: "passwort" }) password: string;

  @BeforeUpdate
  @BeforeCreate
  static async hashPassword(screener: Screener): Promise<void> {
    screener.password = await bcrypt.hash(
      screener.password,
      bcrypt.genSaltSync(8)
    );
  }
}

export const getScreener = async (email: string): Promise<Screener> => {
  return Screener.findOne({
    where: {
      email,
    },
  });
};
