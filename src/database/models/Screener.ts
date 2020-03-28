import { Model, Table, Column, AutoIncrement } from "sequelize-typescript";

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
}

export const getScreener = async (email: string): Promise<Screener> => {
  return Screener.findOne({
    where: {
      email,
    },
  });
};
