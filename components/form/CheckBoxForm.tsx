'use client';
import type { UseFormRegister, FieldValues, Path, FieldErrors } from 'react-hook-form';

export type FiledCheckBoxLabels = {
    id: number | string,
    label: string
}
export type FieldCheckBoxProps<T extends FieldValues> = {
    label: string;
    labelStyle: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    inputStyle: string;
    labels: FiledCheckBoxLabels[];
    errors: FieldErrors<T>;
};

type Props<T extends FieldValues> = { props: FieldCheckBoxProps<T> }

export default function CheckBoxForm<T extends FieldValues>({ props }: Props<T>) {
    const { label, labelStyle, name, register, inputStyle, labels, errors } = props;

    return (
        <div>
            <label className={labelStyle}>{label}</label>
            
            {labels.map((item) => (
                <label key={item.id} className={inputStyle}>
                    <input
                        type='checkbox'
                        {...register(name, {
                            setValueAs: (v) => {

                                const arr = Array.isArray(v) ? v : (v ? [v] : []);
                                return arr.map(Number);
                            },
                        })}
                        value={item.id}
                    />
                    {item.label}
                </label>
            ))}
            {errors[name] && <p className="mt-1 text-sm text-red-600">{String(errors[name]?.message)}</p>}

        </div>
    )
}