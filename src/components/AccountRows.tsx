import { Skeleton, Stack, styled, Typography } from "@mui/material";
import { useLocalStorageContext } from "./LocalStorageProvider";
import { CancelRounded, CheckCircleRounded } from "@mui/icons-material";
import type { TvbAccountStatus } from "@/types";

export interface AccountsRowsProps {
	completedMap: Record<string, TvbAccountStatus>;
	openSettingsModal: () => void;
}

const CursorStack = styled(Stack)({
	cursor: "pointer",
});

export const AccountRows = ({
	completedMap,
	openSettingsModal,
}: AccountsRowsProps) => {
	const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();

	const getIcon = (completed?: boolean) =>
		completed ? (
			<CheckCircleRounded color="success" fontSize="small" />
		) : (
			<CancelRounded color="error" fontSize="small" />
		);

	return (
		<Stack>
			{isLocalStorageLoading
				? [1, 2].map((el) => (
						<Stack key={el} direction="row" spacing={1}>
							<CancelRounded color="disabled" fontSize="small" />
							<Typography>
								<Skeleton width={80} />
							</Typography>
						</Stack>
					))
				: tvbAccounts
						.filter((account) => !account.invisible)
						.map((account) => (
							<CursorStack key={account.monarchId} onClick={openSettingsModal}>
								<Stack direction="row" alignItems="center" spacing={1}>
									{getIcon(completedMap[account.monarchId]?.balances)}
									<Typography>{account.monarchName}</Typography>
								</Stack>
								{completedMap[account.monarchId]?.attempted &&
									!completedMap[account.monarchId].balances && (
										<Stack paddingLeft={4}>
											{(
												[
													{
														key: "transactions",
														title: "Transactions",
													},
													{
														key: "balances",
														title: "Balance",
													},
												] satisfies {
													key: keyof TvbAccountStatus;
													title: string;
												}[]
											).map((step) => (
												<Stack
													key={step.key}
													direction="row"
													alignItems="center"
													spacing={1}
												>
													{getIcon(completedMap[account.monarchId][step.key])}
													<Typography variant="body2">{step.title}</Typography>
												</Stack>
											))}
										</Stack>
									)}
							</CursorStack>
						))}
		</Stack>
	);
};
