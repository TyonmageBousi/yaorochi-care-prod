'use client';

import { Save } from 'lucide-react';

type Props = {
    isFormValid: boolean;
    isSubmitting: boolean;
    onBack: () => void;
};

export default function StockInSubmitButtons({ isFormValid, isSubmitting, onBack }: Props) {
    return (
        <div className="pt-4 space-y-3">
            <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className={`w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-lg font-bold rounded-xl transition-all
                    ${isSubmitting
                        ? 'bg-gradient-to-r from-orange-300 to-amber-300 text-white cursor-not-allowed'
                        : isFormValid
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 hover:shadow-xl active:scale-[0.98]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isSubmitting ? (
                    <><i className="fas fa-spinner fa-spin" />登録中...</>
                ) : isFormValid ? (
                    <><Save className="w-5 h-5" />登録する</>
                ) : (
                    <><i className="fas fa-lock text-sm" />必要事項を入力してください</>
                )}
            </button>
            <button
                type="button"
                onClick={onBack}
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
            >
                キャンセル
            </button>
        </div>
    );
}