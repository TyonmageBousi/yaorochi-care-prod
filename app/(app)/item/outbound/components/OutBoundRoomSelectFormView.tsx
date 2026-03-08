'use client';
import { useMemo } from "react";
import OptionsForm, { FiledOptionsProps } from "@/components/form/OptionsForm";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { OutBoundValues } from "@/lib/validations/outBound";
import { RadioOption } from "@/components/form/RadioForm";

type Props = {
    register: UseFormRegister<OutBoundValues>;
    errors: FieldErrors<OutBoundValues>;
    roomOptions: RadioOption[];
};

const labelStyle = "block text-sm font-bold text-gray-700 mb-2";
const inputStyle = "w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:border-orange-400 focus:outline-none text-base bg-white";

export default function OutBoundRoomSelectFormView({ register, errors, roomOptions }: Props) {

    const roomProps = useMemo<FiledOptionsProps<OutBoundValues>>(() => ({
        label: "利用居室番号",
        labelStyle,
        name: "roomId",
        register,
        inputStyle,
        options: roomOptions,
        errors,
    }), [register, errors, roomOptions]);

    return <OptionsForm props={roomProps} />;
}