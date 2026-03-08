import type { AssetListRow } from "@/lib/repositories/assets/getAllAssets";

export type AssetInventoryFilters = {
  name: string;
  categoryIds: number[];
  storageIds: number[];
  ownerIds: number[];
  roomNumberIds: number[];
};

export const DEFAULT_FILTERS: AssetInventoryFilters = {
  name: "",
  categoryIds: [],
  storageIds: [],
  ownerIds: [],
  roomNumberIds: [],
};

const normalize = (value: string) => value.trim().toLowerCase();

export function hasActiveFilters(filters: AssetInventoryFilters): boolean {
  return Boolean(
    normalize(filters.name) ||
    filters.categoryIds.length > 0 ||
    filters.storageIds.length > 0 ||
    filters.ownerIds.length > 0 ||
    filters.roomNumberIds.length > 0
  );
}

export function toggleId(list: number[], id: number, checked: boolean): number[] {
  if (checked) return list.includes(id) ? list : [...list, id];
  return list.filter((x) => x !== id);
}

export function filterAssets(assets: AssetListRow[], filters: AssetInventoryFilters): AssetListRow[] {
  const name = normalize(filters.name);
  return assets.filter((asset) => {

    // 商品名
    if (name && !normalize(String(asset.name ?? "")).includes(name)) return false;

    // カテゴリ
    if (
      filters.categoryIds.length > 0 &&
      !filters.categoryIds.includes(Number(asset.categoryId))
    ) {
      return false;
    }

    // 保存場所
    const storageId = asset.currentStorageId;
    if (
      filters.storageIds.length > 0 &&
      (storageId == null || !filters.storageIds.includes(storageId))
    ) {
      return false;
    }

    // 所有者
    if (
      filters.ownerIds.length > 0 &&
      !filters.ownerIds.includes(Number(asset.owner))
    ) {
      return false;
    }

    // 部屋番号
    const roomId = asset.roomNumberId;
    if (
      filters.roomNumberIds.length > 0 &&
      (roomId == null || !filters.roomNumberIds.includes(roomId))
    ) {
      return false;
    }

    return true;
  });
}

export function getTotalPages(totalCount: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.ceil(totalCount / limit);
}

export function paginate<T>(items: T[], page: number, limit: number): T[] {
  if (limit <= 0) return items;
  const safePage = Math.max(1, page);
  const start = (safePage - 1) * limit;
  return items.slice(start, start + limit);
}
