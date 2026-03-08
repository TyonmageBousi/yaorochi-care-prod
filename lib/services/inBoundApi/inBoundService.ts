// src/lib/services/inBound/service.ts
import { insertInBoundTransactions, makeSelectChain } from "@/lib/repositories/items/insertInBound";
import { BusinessValidationError } from "@/types/handleApiErrorType";
import { InBoundRequest, InBoundRow } from "@/lib/validations/inBound";
import type { BusinessErrors } from "../../../types/handleApiErrorType";



export async function validateMasterData(facilityId: number, rows: InBoundRow[]): Promise<BusinessErrors> {
    const itemIds = [...new Set(rows.map(r => r.itemId))];
    const storageIds = [...new Set(rows.map(r => r.storageId))];

    const { itemRows, storageRows } = await makeSelectChain(facilityId, itemIds, storageIds);

    const itemSet = new Set(itemRows.map(i => i.id));
    const storageSet = new Set(storageRows.map(s => s.id));

    return rows.reduce<BusinessErrors>((errors, row, i) => {
        if (!itemSet.has(row.itemId)) {
            errors[`rows.${i}.itemId`] = ["該当の商品が見つかりません（商品マスタから削除された可能性があります）"];
        }
        if (!storageSet.has(row.storageId)) {
            errors[`rows.${i}.storageId`] = [`保管場所（ID: ${row.storageId}）が見つかりません`];
        }
        return errors;
    }, {});
}



export async function processInbound(data: InBoundRequest, facilityId: number, userId: number): Promise<number> {
    const masterValidationErrors = await validateMasterData(facilityId, data.rows);

    if (Object.keys(masterValidationErrors).length) {
        throw new BusinessValidationError(
            "入力内容を確認してください",
            422,
            "VALIDATION_ERROR",
            masterValidationErrors
        );
    }

    const count = await insertInBoundTransactions(facilityId, userId, data.rows);
    return count;
}
