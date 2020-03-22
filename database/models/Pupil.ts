import { Model, Table, Column } from "sequelize-typescript";

@Table
export class Pupil extends Model<Pupil> {
	@Column firstname: string;
	@Column lastname: string;
	@Column email!: string;
	@Column creation_date: Date;
}
