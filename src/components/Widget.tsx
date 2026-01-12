import { useState } from "react";
import { usePageContext } from "@/api";
import { Separator } from "@/components/shadcn/separator";
import { cn } from "@/lib/utils";
import { driveAccount } from "@/methods";
import type { TvbAccountStatus } from "@/types";
import { AccountRows } from "./AccountRows";
import { useLoadingScreenContext } from "./LoadingScreenProvider";
import { useLocalStorageContext } from "./LocalStorageProvider";
import { SettingsModal } from "./SettingsModal";
import { TitleUpload } from "./TitleUpload";

export const widgetInputId = "MonarchSplitwiseInput";

export const Widget = () => {
	const { authToken } = usePageContext();
	const { toggleLoading } = useLoadingScreenContext();
	const { tvbAccounts, isLocalStorageLoading, cornerPosition, splitwiseName } =
		useLocalStorageContext();
	const isAccountsEmpty =
		!isLocalStorageLoading &&
		!tvbAccounts.filter((account) => !account.invisible).length;

	const [completedMap, setCompletedMap] = useState<
		Record<string, TvbAccountStatus>
	>({});
	const [isSettingsModalOpen, setIsSettingsModalOpen] =
		useState<boolean>(false);

	const processFiles = async (files: File[]) => {
		if (!authToken) {
			console.error("No authorization token found");
			return;
		}
		const loadingKey = toggleLoading();
		for (const account of tvbAccounts) {
			const response = await driveAccount(
				account,
				files,
				authToken,
				splitwiseName,
			);
			setCompletedMap((prev) => ({
				...prev,
				[account.monarchId]: response.attempted
					? response
					: prev[account.monarchId],
			}));
		}
		toggleLoading(false, loadingKey);
	};

	return (
		<>
			<div
				className={cn(
					"fixed bottom-2 z-10 pointer-events-auto p-2 bg-card border rounded-lg shadow-md",
					!isLocalStorageLoading && cornerPosition === "right" && "right-2",
					!isLocalStorageLoading && cornerPosition === "left" && "left-2",
				)}
			>
				<div className="flex flex-col gap-2">
					<TitleUpload
						id={widgetInputId}
						onUpload={processFiles}
						onClick={
							isAccountsEmpty ? () => setIsSettingsModalOpen(true) : undefined
						}
					/>
					{!isAccountsEmpty && (
						<>
							<Separator />
							<AccountRows
								completedMap={completedMap}
								openSettingsModal={() => setIsSettingsModalOpen(true)}
							/>
						</>
					)}
				</div>
			</div>
			<SettingsModal
				open={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
			/>
		</>
	);
};
