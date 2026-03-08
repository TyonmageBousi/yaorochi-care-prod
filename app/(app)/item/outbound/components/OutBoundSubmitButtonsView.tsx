'use client';

type Props = {
    isSubmitting: boolean;
    onBack: () => void;
};

const submitButtonStyle = "w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-5 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all text-lg disabled:opacity-50";
const cancelButtonStyle = "w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all";

export default function OutBoundSubmitButtonsView({ isSubmitting, onBack }: Props) {
    return (
        <div className="pt-4 space-y-3">
            <button
                type="submit"
                disabled={isSubmitting}
                className={submitButtonStyle}
            >
                {isSubmitting ? "記録中..." : " 払出を記録する"}
            </button>
            <button
                type="button"
                onClick={onBack}
                className={cancelButtonStyle}
            >
                キャンセル
            </button>
        </div>
    );
}