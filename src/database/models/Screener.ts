import { Model, Table, Column } from "sequelize-typescript";

@Table({
  timestamps: false,
  tableName: "screener",
})
export class Screener extends Model<Screener> {
  @Column({ primaryKey: true }) id: number;
  @Column({ field: "vorname" }) firstname: string;
  @Column({ field: "nachname" }) lastname: string;
  @Column email: string;
  @Column({ field: "passwort" }) passwordHash: string;
}

export const getScreener = async (email: string): Promise<Screener> => {
  return Screener.findOne({
    where: {
      email,
    },
  });
};
