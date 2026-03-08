'use client';
import type { FieldValues, UseFormRegister, Path, FieldErrors } from 'react-hook-form';
import { useState } from 'react';


export type FieldPasswordProps<T extends FieldValues> = {
    label: string;
    labelStyle: string;
    name: Path<T>;
    register: UseFormRegister<T>;
    inputStyle?: string;
    placeholder?: string;
    errors: FieldErrors<T>;
};

type Props<T extends FieldValues> = { props: FieldPasswordProps<T> };

export default function PasswordForm<T extends FieldValues>({ props }: Props<T>) {
    const [showPwd, setShowPwd] = useState(false);
    const { label, name, register, labelStyle, inputStyle, placeholder, errors } = props;
    return (
        <div>
            <label htmlFor={name} className={labelStyle}>{label}</label>
            <div className='relative'>
                <input
                    id={name}
                    type={showPwd ? 'text' : 'password'}
                    {...register(name)}
                    className={inputStyle}
                    placeholder={placeholder}
                />
                <button
                    type='button'
                    onClick={() => setShowPwd(!showPwd)}
                    className='absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-brown-700/70 hover:bg-black/5'
                >
                    {showPwd ? '🙈' : '👁️'}
                </button>
            </div>
            {errors[name] && <p className="mt-1 text-sm text-red-600">{String(errors[name]?.message)}</p>}
        </div>
    );
}