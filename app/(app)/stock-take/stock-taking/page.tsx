import { StockTakeCountView } from "@/app/(app)/stock-take/stock-taking/components/StockTakeCountView";
import { getAllStockTakeLines } from "@/lib/repositories/stockTakes/getAllStockTakeLines"
import { redirect } from 'next/navigation';
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';
import { ITEM_STATUS_FLAGS } from "@/db/schema"
import { getStockTakeSession } from "@/lib/repositories/stockTakes/getStockTakeSession"
import { STOCKTAKE_STATUS } from "@/db/schema"

export default async function StockTakeCountPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await requireUserForPage();
  const facilityId = user.facilityId;

  const { id } = await searchParams;
  const stockTakeId = Number(id);

  if (!stockTakeId) redirect('/stock-take/select-location');

  const stockTakeSession = await getStockTakeSession({ stockTakeId, facilityId })

  //進行中の棚卸判定
  if (stockTakeSession.status !== STOCKTAKE_STATUS.IN_PROGRESS) {
    redirect('/stock-take/select-location');
  }

  const status = ITEM_STATUS_FLAGS.ACTIVE;
  const stockTakeLines = await getAllStockTakeLines(facilityId, stockTakeId, status);

  if (stockTakeLines.length === 0) redirect('/stock-take/select-location');

  return <StockTakeCountView stockTakeId={stockTakeId} stockTakeLines={stockTakeLines} />;
}