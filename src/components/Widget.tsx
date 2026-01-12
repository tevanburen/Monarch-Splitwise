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

/**
 * Main widget component that handles file uploads and displays account status.
 * Manages the upload flow for Splitwise CSV files and coordinates with Monarch accounts.
 *
 * @component
 */
export const Widget = () => {
	const { authToken } = usePageContext();
	const { toggleLoading } = useLoadingScreenContext();
	const { tvbAccounts, isLocalStorageLoading, cornerPosition, splitwiseName } =
		useLocalStorageContext();
	const isAccountsEmpty =
		!isLocalStorageLoading &&
		!tvbAccounts.filter((account) => !account.invisible).length;

	/**
	 * State
	 */
	const [completedMap, setCompletedMap] = useState<
		Record<string, TvbAccountStatus>
	>({});
	const [isSettingsModalOpen, setIsSettingsModalOpen] =
		useState<boolean>(false);

	/**
	 * Functions
	 */

	/**
	 * Processes uploaded Splitwise CSV files by driving each configured account.
	 * Updates completion status for each account as transactions are processed.
	 *
	 * @param files - Array of Splitwise CSV files to process
	 */
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
