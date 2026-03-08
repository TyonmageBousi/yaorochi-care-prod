'use client';

interface AssetSearchBarProps {
  searchCode: string;
  searchName: string;
  resultCount: number;
  onChangeSearchCode: (v: string) => void;
  onChangeSearchName: (v: string) => void;
  onClearSearch: () => void;
}

// コードと名前で共通の入力スタイル
const inputStyle = 'flex-1 min-w-0 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-orange-400 transition-colors';

export default function AssetBoundSearchView({
  searchCode,
  searchName,
  resultCount,
  onChangeSearchCode,
  onChangeSearchName,
  onClearSearch,
}: AssetSearchBarProps) {
  const hasQuery = searchCode.trim() || searchName.trim();

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-orange-100 p-4 mb-5">
      {/* 検索入力エリア */}
      <div className="flex items-center gap-3">
        <i className="fas fa-search text-orange-300 text-sm flex-shrink-0" />
        <input
          type="text"
          value={searchCode}
          onChange={(e) => onChangeSearchCode(e.target.value)}
          placeholder="コードで検索"
          className={inputStyle}
        />
        <input
          type="text"
          value={searchName}
          onChange={(e) => onChangeSearchName(e.target.value)}
          placeholder="名前で検索"
          className={inputStyle}
        />
        {/* 検索文字があるときだけクリアボタンを表示 */}
        {hasQuery && (
          <button
            type="button"
            onClick={onClearSearch}
            className="flex-shrink-0 flex items-center gap-1.5 text-sm text-orange-600 hover:text-orange-800 bg-orange-50 hover:bg-orange-100 rounded-xl px-3 py-2 transition-colors"
          >
            <i className="fas fa-times text-xs" />
            クリア
          </button>
        )}
      </div>

      {/* 検索結果件数 */}
      <p className="text-xs text-gray-400 mt-2 pl-1">
        候補: <span className="font-semibold text-orange-500">{resultCount}</span> 件
      </p>

    </div>
  );
}