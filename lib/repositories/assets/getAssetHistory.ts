import { db } from "@/db/index";
import { assetEvents, AssetStatus } from "@/db/schema";
import { eq } from "drizzle-orm";


export type AssetHistoryRow = {
    eventId: number;
    type: AssetStatus;
    performedAt: Date;
    assetName: string;
    assetCode: string;
    createdBy: string | null;
    roomNumber: string | null;
};

export async function getAssetHistory(facilityId: number, limit?: number): Promise<AssetHistoryRow[]> {
    const rows = await db.query.assetEvents.findMany({
        where: eq(assetEvents.facilityId, facilityId),
        orderBy: (t, { desc }) => desc(t.performedAt),
        limit,
        columns: {
            id: true,
            type: true,
            performedAt: true,
        },
        with: {
            asset: {
                columns: {
                    name: true,
                    assetCode: true,
                },
            },
            performedByUser: {
                columns: {
                    name: true,
                },
            },
            toRoomNumber: {
                columns: {
                    label: true,
                },
            },
        },
    });

    return rows.map((row) => ({
        eventId: row.id,
        type: row.type as AssetStatus,
        performedAt: row.performedAt,
        assetName: row.asset.name,
        assetCode: row.asset.assetCode,
        createdBy: row.performedByUser?.name ?? null,
        roomNumber: row.toRoomNumber?.label ?? null,
    }));
}