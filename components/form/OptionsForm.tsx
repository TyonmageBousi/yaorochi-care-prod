'use client';
import type { FieldValues, UseFormRegister, FieldErrors, Path } from 'react-hook-form';

export type Options = { id: number, label: string }

export type FiledOptionsProps<T extends FieldValues> = {
    label: string;
    labelStyle: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    inputStyle?: string;
    options: readonly Options[];
    errors: FieldErrors<T>
    onChange?: (value: string) => void;
};

type Props<T extends FieldValues> = { props: FiledOptionsProps<T> };

export default function OptionsForm<T extends FieldValues>({ props }: Props<T>) {
    const { label, name, register, labelStyle, inputStyle, options, onChange, errors } = props;
    return (
        <div>
            <label htmlFor={name} className={labelStyle}>{label}</label>
            <select
                id={name}
                {...register(name, {
                    onChange: (e) => onChange?.(e.target.value)  
                })}
                className={inputStyle}
            >
                {
                    options.map((option) => (
                        <option key={option.id} className='text-black' value={option.id}>{option.label}</option>
                    ))}
            </select>
            {errors[name] && <p className="mt-1 text-sm text-red-600">{String(errors[name]?.message)}</p>}

        </div >
    );
}
