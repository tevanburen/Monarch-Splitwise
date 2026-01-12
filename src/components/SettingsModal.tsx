import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/shadcn/select";
import type { TvbAccount } from "@/types";
import { useLocalStorageContext } from "./LocalStorageProvider";
import { SettingsModalRow } from "./SettingsModalRow";

export interface SettingsModalProps {
	open: boolean;
	onClose: () => void;
}

type TvbAccountWithRowKey = TvbAccount & { rowKey: number };
let rowKey = 0;

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
	const {
		tvbAccounts,
		cornerPosition,
		isLocalStorageLoading,
		setLocalStorage,
	} = useLocalStorageContext();

	const [currentAccounts, setCurrentAccounts] = useState<
		TvbAccountWithRowKey[]
	>([]);

	const resetAccounts = useCallback(
		() =>
			setCurrentAccounts(
				tvbAccounts.map((row) => ({ ...row, rowKey: rowKey++ })),
			),
		[tvbAccounts],
	);

	useEffect(() => {
		if (open) {
			resetAccounts();
		}
	}, [resetAccounts, open]);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent className="max-w-2xl" showCloseButton={true}>
				<DialogHeader>
					<div className="flex flex-row items-center justify-between">
						<DialogTitle>Settings</DialogTitle>
						<div className="flex flex-row gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => resetAccounts()}
							>
								Reset
							</Button>
							<Button
								variant="secondary"
								size="sm"
								onClick={() => {
									setLocalStorage("tvbAccounts", currentAccounts);
									onClose();
								}}
								disabled={currentAccounts.some(
									(row) =>
										!(row.monarchId && row.monarchName && row.splitwiseName),
								)}
							>
								Save
							</Button>
						</div>
					</div>
				</DialogHeader>
				<div className="border-t" />
				{isLocalStorageLoading ? (
					<div className="h-16 w-full flex items-center justify-center">
						<div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<Select
							value={cornerPosition}
							onValueChange={(value) =>
								setLocalStorage("cornerPosition", value as "left" | "right")
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Position" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="left">Left</SelectItem>
								<SelectItem value="right">Right</SelectItem>
							</SelectContent>
						</Select>
						<div className="border-t" />
						{currentAccounts.map((row, index) => (
							<div key={row.rowKey} className="flex flex-col gap-2 pt-2">
								<SettingsModalRow
									updateTvbAccount={(
										field: keyof TvbAccount,
										value: string | boolean | null,
									) =>
										setCurrentAccounts((prev) => {
											const newRows = [...prev];
											newRows[index] = { ...newRows[index], [field]: value };
											return newRows;
										})
									}
									tvbAccount={row}
									deleteAccount={() => {
										setCurrentAccounts((prev) => {
											const newRows = [...prev];
											newRows.splice(index, 1);
											return newRows;
										});
									}}
								/>
								<div className="border-t" />
							</div>
						))}
						<div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									const newKey = rowKey++;
									setCurrentAccounts((prev) => [
										...prev,
										{
											monarchId: "",
											monarchName: "",
											splitwiseName: "",
											rowKey: newKey,
											startDate: null,
										},
									]);
								}}
							>
								<Plus className="size-4" />
								Add account
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
