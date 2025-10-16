import { Divider, Paper, Stack, styled } from "@mui/material";
import { useState } from "react";
import { usePageContext } from "@/api";
import { driveAccount } from "@/methods";
import type { CornerPosition, TvbAccountStatus } from "@/types";
import { AccountRows } from "./AccountRows";
import { useLoadingScreenContext } from "./LoadingScreenProvider";
import { useLocalStorageContext } from "./LocalStorageProvider";
import { SettingsModal } from "./SettingsModal";
import { TitleUpload } from "./TitleUpload";

export const widgetInputId = "MonarchSplitwiseInput";

const StyledWidget = styled(Paper, {
	shouldForwardProp: (prop: string) => prop !== "position",
})<{
	cornerPosition: CornerPosition | undefined;
}>(({ theme, cornerPosition }) => ({
	bottom: theme.spacing(1),
	right: cornerPosition === "right" ? theme.spacing(1) : undefined,
	left: cornerPosition === "left" ? theme.spacing(1) : undefined,
	position: "fixed",
	pointerEvents: "auto",
	padding: theme.spacing(1),
}));

export const Widget = () => {
	const { authToken } = usePageContext();
	const { toggleLoading } = useLoadingScreenContext();
	const { tvbAccounts, isLocalStorageLoading, cornerPosition } =
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
			const response = await driveAccount(account, files, authToken);
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
		<StyledWidget
			elevation={3}
			cornerPosition={isLocalStorageLoading ? undefined : cornerPosition}
		>
			<Stack spacing={1}>
				<TitleUpload
					id={widgetInputId}
					onUpload={processFiles}
					onClick={
						isAccountsEmpty ? () => setIsSettingsModalOpen(true) : undefined
					}
				/>
				{!isAccountsEmpty && (
					<>
						<Divider />
						<AccountRows
							completedMap={completedMap}
							openSettingsModal={() => setIsSettingsModalOpen(true)}
						/>
					</>
				)}
			</Stack>
			<SettingsModal
				open={isSettingsModalOpen}
				onClose={() => setIsSettingsModalOpen(false)}
			/>
		</StyledWidget>
	);
};
