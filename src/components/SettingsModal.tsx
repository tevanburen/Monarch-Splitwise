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
import { Input } from "@/components/shadcn/input";
import { Separator } from "@/components/shadcn/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/shadcn/toggle-group";
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
		splitwiseName,
		isLocalStorageLoading,
		setLocalStorage,
	} = useLocalStorageContext();

	const [currentAccounts, setCurrentAccounts] = useState<
		TvbAccountWithRowKey[]
	>([]);
	const [currentSplitswiseName, setCurrentSplitswiseName] =
		useState<string>("");

	const resetAccounts = useCallback(() => {
		setCurrentAccounts(
			tvbAccounts.map((row) => ({ ...row, rowKey: rowKey++ })),
		);
		setCurrentSplitswiseName(splitwiseName);
	}, [tvbAccounts, splitwiseName]);

	useEffect(() => {
		if (open) {
			resetAccounts();
		}
	}, [resetAccounts, open]);

	return (
		<Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
			<DialogContent
				className="max-w-2xl"
				showCloseButton={true}
				onPointerDownOutside={(e) => e.preventDefault()}
			>
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
						<div className="flex items-center justify-between pb-2">
							<div className="text-sm font-medium">Position</div>
							<ToggleGroup
								type="single"
								value={cornerPosition}
								onValueChange={(value) =>
									value &&
									setLocalStorage("cornerPosition", value as "left" | "right")
								}
								variant="outline"
							>
								<ToggleGroupItem value="left">Left</ToggleGroupItem>
								<ToggleGroupItem value="right">Right</ToggleGroupItem>
							</ToggleGroup>
						</div>
						<div className="flex items-center justify-between pb-2">
							<div className="text-sm font-medium">Your Splitwise Name</div>
							<Input
								value={currentSplitswiseName}
								onChange={(e) => setCurrentSplitswiseName(e.target.value)}
								placeholder="e.g., Haynes King"
								className="max-w-xs"
							/>
						</div>
						<Separator />
						<div className="max-h-96 overflow-y-auto pr-2">
							{currentAccounts.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 text-center">
									<p className="text-sm text-muted-foreground">
										No accounts configured yet
									</p>
									<p className="text-xs text-muted-foreground mt-1">
										Click "Add account" below to get started
									</p>
								</div>
							) : (
								currentAccounts.map((row, index) => (
									<div key={row.rowKey} className="flex flex-col gap-2">
										<SettingsModalRow
											updateTvbAccount={(
												field: keyof TvbAccount,
												value: string | boolean | null,
											) =>
												setCurrentAccounts((prev) => {
													const newRows = [...prev];
													newRows[index] = {
														...newRows[index],
														[field]: value,
													};
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
										{index < currentAccounts.length - 1 && (
											<Separator className="mb-2" />
										)}
									</div>
								))
							)}
						</div>
						<Separator />
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
							setLocalStorage("splitwiseName", currentSplitswiseName);
							onClose();
						}}
						disabled={
							!currentSplitswiseName ||
							currentAccounts.some(
								(row) =>
									!(row.monarchId && row.monarchName && row.splitwiseName),
							)
						}
					>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
