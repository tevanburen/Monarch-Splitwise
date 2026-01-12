import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/shadcn/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import { Separator } from "@/components/shadcn/separator";
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
					<DialogTitle>Settings</DialogTitle>
				</DialogHeader>
				<Separator />
				{isLocalStorageLoading ? (
					<div className="h-16 w-full flex items-center justify-center">
						<div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" className="w-full justify-start">
									Position:{" "}
									{cornerPosition.charAt(0).toUpperCase() +
										cornerPosition.slice(1)}
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem
									onClick={() => setLocalStorage("cornerPosition", "left")}
								>
									Left
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => setLocalStorage("cornerPosition", "right")}
								>
									Right
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Separator />
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
								<Separator />
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
				<DialogFooter>
					<Button variant="outline" onClick={() => resetAccounts()}>
						Reset
					</Button>
					<Button
						variant="secondary"
						onClick={() => {
							setLocalStorage("tvbAccounts", currentAccounts);
							onClose();
						}}
						disabled={currentAccounts.some(
							(row) => !(row.monarchId && row.monarchName && row.splitwiseName),
						)}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
