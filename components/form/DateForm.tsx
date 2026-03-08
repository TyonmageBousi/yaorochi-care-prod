'use client';
import type { FieldValues, UseFormRegister, Path, FieldErrors } from 'react-hook-form';


export type FieldDateProps<T extends FieldValues> = {
    label: string;
    labelStyle: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    inputStyle?: string;
    errors: FieldErrors<T>
};

type Props<T extends FieldValues> = { props: FieldDateProps<T> }

export default function DateForm<T extends FieldValues>({ props }: Props<T>) {
    const { label, name, register, labelStyle, inputStyle, errors } = props;
    return (
        <div>
            <label className={labelStyle} htmlFor={String(name)}>
                {label}
            </label>
            <input
                id={String(name)}
                type='date'
                {...register(name, {
                })}
                className={inputStyle}
            />
            {errors[name] && <p className="mt-1 text-sm text-red-600">{String(errors[name]?.message)}</p>}

        </div>
    );
}
