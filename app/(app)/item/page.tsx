import LinkCard from "@/components/LinkCard"

export default async function ItemPage() {
    return (
        <LinkCard
            dispatchLabel={"消耗品新規登録"}
            dispatchUrl={"/item/item-register/new"}
            historyLabel={"消耗品一覧"}
            historyUrl={"/item/item-inventory"}
        />
    );
}