enum Semester { Autumn, Spring, All };

export type Code = {
    validation_token?: string;
	email: string;
	semester?: Semester;
	year?: number;
    email_sent: Date;
};
