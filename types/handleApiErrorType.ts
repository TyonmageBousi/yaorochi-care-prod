export type BusinessErrors = Record<string, string[]>;

export class BusinessValidationError extends Error {
    public readonly details?: BusinessErrors;
    public readonly code: string;
    public readonly status: number;


    constructor(message: string, status = 400, code: string, errors?: BusinessErrors) {
        super(message);
        this.name = "BusinessValidationError";
        this.status = status;
        this.code = code;
        this.details = errors;

    }
}