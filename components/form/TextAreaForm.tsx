'use client';
import type { UseFormRegister, FieldValues, Path, FieldErrors } from 'react-hook-form';

export type FieldTextAreaProps<T extends FieldValues> = {
    label: string;
    labelStyle: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    inputStyle: string;
    rows: number
    placeholder?: string;
    errors: FieldErrors<T>;
};

type Props<T extends FieldValues> = { props: FieldTextAreaProps<T> };

export default function TextAreaForm<T extends FieldValues>({ props }: Props<T>) {
    const { label, name, register, labelStyle, inputStyle, rows, placeholder, errors } = props;
    return (
        <div>
            <label className={labelStyle}>{label}</label>
            <textarea
                id={name}
                rows={rows}
                {...register(name)}
                className={inputStyle}
                placeholder={placeholder}
            >
            </textarea>
            {errors[name] && <p className='error'>{String(errors[name]?.message)}</p>}

        </div >
    );
}
