'use client';

import type { UseFormRegister, FieldValues, Path, FieldErrors } from 'react-hook-form';

export type RadioOption = {
    id: number;
    label: string;
};

export type FieldRadioProps<T extends FieldValues> = {
    label: string;
    labelStyle?: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    itemStyle?: string;
    options: RadioOption[];
    errors: FieldErrors<T>;
    required?: boolean;
    onChange?: (value: string) => void;
};

type Props<T extends FieldValues> = {
    props: FieldRadioProps<T>;
};

export default function RadioForm<T extends FieldValues>({ props }: Props<T>) {
    const {
        label,
        labelStyle = "block text-sm font-medium text-gray-700 mb-2",
        name,
        register,
        itemStyle = "flex items-center gap-3 cursor-pointer",
        options,
        errors,
        required,
        onChange,
    } = props;

    return (
        <div>
            <label className={labelStyle}>
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="space-y-2">
                {options.map((option) => {
                    const reg = register(name, {
                        required: required ? `${label}を選択してください` : false,
                        
                    });

                    return (
                        <label key={option.id} className={itemStyle}>
                            <input
                                type="radio"
                                value={String(option.id)}
                                {...reg}
                                onChange={(e) => {

                                    reg.onChange(e);
                                    onChange?.(e.target.value);
                                }}
                                className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-gray-700">{option.label}</span>
                        </label>
                    );
                })}
            </div>

            {errors[name] && (
                <p className="mt-1 text-sm text-red-600">
                    {String(errors[name]?.message)}
                </p>
            )}
        </div>
    );
}
