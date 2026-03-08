import { z } from 'zod';

export function buildFieldErrors(issues: z.core.$ZodIssue[]) {
    return issues.reduce<Record<string, string[]>>((fieldErrors, issue) => {
        const field = issue.path.join(".");
        fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
        return fieldErrors;
    }, {});
}

