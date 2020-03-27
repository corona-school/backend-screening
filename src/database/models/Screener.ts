import { Model, Table, Column } from "sequelize-typescript";

@Table({
	timestamps: false,
	tableName: "screener",
})
export class Screener extends Model<Screener> {
	@Column({ field: "vorname" }) firstname: string;
	@Column({ field: "nachname" }) lastname: string;
	@Column({ primaryKey: true }) email: string;
	@Column({ field: "passwort" }) passwordHash: string;

}
