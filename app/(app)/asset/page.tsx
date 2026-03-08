import LinkCard from "@/components/LinkCard"

export default async function AssetPage() {

    return (
        <LinkCard
            dispatchLabel={"資産新規登録"}
            dispatchUrl={"/asset/asset-register/new"}
            historyLabel={"資産一覧"}
            historyUrl={"/asset/asset-inventory"}
        />
    );
}
