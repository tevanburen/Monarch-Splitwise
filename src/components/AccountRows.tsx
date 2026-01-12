import { CheckCircle, XCircle } from "lucide-react";
import type { TvbAccountStatus } from "@/types";
import { useLocalStorageContext } from "./LocalStorageProvider";

export interface AccountsRowsProps {
	completedMap: Record<string, TvbAccountStatus>;
	openSettingsModal: () => void;
}

export const AccountRows = ({
	completedMap,
	openSettingsModal,
}: AccountsRowsProps) => {
	const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();

	const getIcon = (completed?: boolean) =>
		completed ? (
			<CheckCircle className="size-4 text-secondary" />
		) : (
			<XCircle className="size-4 text-primary" />
		);

	return (
		<div className="flex flex-col">
			{isLocalStorageLoading
				? [1, 2].map((el) => (
						<div key={el} className="flex flex-row gap-2">
							<XCircle className="size-4 text-muted-foreground opacity-70" />
							<div className="h-4 w-20 bg-muted animate-pulse rounded" />
						</div>
					))
				: tvbAccounts
						.filter((account) => !account.invisible)
						.map((account) => (
							<button
								type="button"
								key={account.monarchId}
								className="cursor-pointer w-full text-left bg-transparent border-0 p-0"
								onClick={openSettingsModal}
							>
								<div className="flex flex-row items-center gap-2">
									{getIcon(completedMap[account.monarchId]?.balances)}
									<span className="text-foreground">{account.monarchName}</span>
								</div>
								{completedMap[account.monarchId]?.attempted &&
									!completedMap[account.monarchId].balances && (
										<div className="pl-4">
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
												<div
													key={step.key}
													className="flex flex-row items-center gap-2"
												>
													{getIcon(completedMap[account.monarchId][step.key])}
													<span className="text-sm">{step.title}</span>
												</div>
											))}
										</div>
									)}
							</button>
						))}
		</div>
	);
};
