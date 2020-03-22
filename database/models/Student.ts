import { Model, Table, Column } from "sequelize-typescript";

@Table
export class Student extends Model<Student> {
	@Column firstname: string;
	@Column lastname: string;
	@Column email!: string;
	@Column creation_date: Date;
	@Column birthday: Date;
	@Column subjects: string;
	@Column msg: string;
	@Column wix_id: string;
	@Column phone: string;
	@Column verified: boolean;
}
