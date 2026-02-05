import { useState } from "react";
import { Separator } from "@/components/shadcn/separator";
import { WIDGET_INPUT_ID } from "@/constants";
import { driveAccount } from "@/methods";
import {
	useLoadingScreenContext,
	useLocalStorageContext,
	usePageContext,
} from "@/providers";
import type { TvbAccountStatus } from "@/types";
import { AccountRows } from "./AccountRows";
import { WidgetCard } from "./library";
import { SettingsModal } from "./settings-modal";
import { TitleUpload } from "./TitleUpload";

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
			<WidgetCard cornerPosition={cornerPosition}>
				<div className="flex flex-col gap-2">
					<TitleUpload
						id={WIDGET_INPUT_ID}
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
			</WidgetCard>
			<SettingsModal
				open={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
			/>
		</>
	);
};
