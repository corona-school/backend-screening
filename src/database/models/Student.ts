import { Model, Table, Column } from "sequelize-typescript";

@Table({
	timestamps: false
})
export class Student extends Model<Student> {
	@Column firstname: string;
	@Column lastname: string;
	@Column({ primaryKey: true }) email: string;
	@Column verified: boolean;
}
