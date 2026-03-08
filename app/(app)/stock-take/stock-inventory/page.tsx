import { StockTakeReviewView } from "@/app/(app)/stock-take/stock-inventory/components/StockTakeReviewView";
import { getAllStockTakeLines } from "@/lib/repositories/stockTakes/getAllStockTakeLines";
import { redirect } from 'next/navigation';
import { requireUserForPage } from '@/lib/services/auth/requireUserForPage';
import { STOCKTAKE_STATUS } from "@/db/schema"

export default async function StockTakeInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const user = await requireUserForPage();
  const facilityId = user.facilityId;

  const { id } = await searchParams;
  const stockTakeId = Number(id);
  if (!stockTakeId) redirect('/stock-take/select-location');
  const status = STOCKTAKE_STATUS.IN_PROGRESS;
  const stockTakeLines = await getAllStockTakeLines(facilityId, stockTakeId, status);

  if (stockTakeLines.length === 0) redirect('/stock-take/select-location');
  
  return (
    <StockTakeReviewView
      stockTakeLines={stockTakeLines}
      stockTakeId={stockTakeId}
    />
  );
}