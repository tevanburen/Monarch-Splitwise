/**
 * Settings modal component for configuring Monarch-Splitwise account mappings.
 *
 * Allows users to:
 * - Add/edit/remove account mappings between Splitwise groups and Monarch accounts
 * - Toggle accounts active/inactive
 * - Set start dates for transaction filtering
 * - Choose widget position (left/right corner)
 */

import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/scripts/ui/components/shadcn/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
} from "@/scripts/ui/components/shadcn/dialog";
import { Field, FieldDescription } from "@/scripts/ui/components/shadcn/field";
import { Input } from "@/scripts/ui/components/shadcn/input";
import { Separator } from "@/scripts/ui/components/shadcn/separator";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/scripts/ui/components/shadcn/tabs";
import { useRuntimeStateContext } from "@/scripts/ui/providers";
import type { TvbAccount, WidgetLocation, WidgetStatus } from "@/types";

/**
 * Modal dialog for managing extension settings and account configurations.
 *
 * @component
 */
export const SettingsModal = () => {
	const {
		status,
		updateSingleTempState,
		tempAccounts,
		tempLocation,
		exitSettings,
	} = useRuntimeStateContext();

	const handleChange = (
		index: number,
		field: keyof TvbAccount,
		value: string | boolean,
	) => {
		updateSingleTempState("tempAccounts", (prev: TvbAccount[]) => {
			const updatedAccounts = [...prev];
			updatedAccounts[index] = {
				...updatedAccounts[index],
				[field]: value,
			};
			return updatedAccounts;
		});
	};

	const handleAdd = () => {
		updateSingleTempState("tempAccounts", (prev: TvbAccount[]) => {
			return [
				{
					splitwiseId: "",
					monarchId: "",
					startDate: "",
					accountName: "",
				} satisfies TvbAccount,
				...prev,
			];
		});
	};

	const handleDelete = (index: number) => {
		updateSingleTempState("tempAccounts", (prev: TvbAccount[]) => {
			return prev.filter((_, i) => i !== index);
		});
	};

	return (
		<Dialog
			open={status === "editing"}
			onOpenChange={(open) => {
				if (!open) {
					updateSingleTempState<WidgetStatus>("status", "idle");
				}
			}}
		>
			<DialogOverlay className="bg-black/40" />
			<DialogContent
				onInteractOutside={(e) => e.preventDefault()}
				showCloseButton={false}
			>
				<DialogHeader>
					<DialogTitle>Settings</DialogTitle>
					<DialogDescription>
						Configure widget preferences and add your Splitwise-Monarch account
						mappings below.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Widget location</h3>
						<Tabs value={tempLocation}>
							<TabsList>
								<TabsTrigger
									value="left"
									onClick={() =>
										updateSingleTempState<WidgetLocation>(
											"tempLocation",
											"left",
										)
									}
								>
									Left
								</TabsTrigger>
								<TabsTrigger
									value="right"
									onClick={() =>
										updateSingleTempState<WidgetLocation>(
											"tempLocation",
											"right",
										)
									}
								>
									Right
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Accounts</h3>
						<Button variant="outline" size="sm" onClick={handleAdd}>
							<Plus className="h-4 w-4 mr-2" />
							Add account
						</Button>
					</div>
					<div className="border rounded-lg overflow-hidden flex flex-col max-h-96 -mt-2">
						<div className="overflow-y-auto">
							{tempAccounts.length === 0 ? (
								<div className="p-4 text-center text-sm text-muted-foreground">
									No accounts yet. Click "Add account" to get started.
								</div>
							) : (
								tempAccounts.map((account, index) => (
									// biome-ignore lint/suspicious/noArrayIndexKey: Necessary for dynamic list
									<div key={tempAccounts.length - index}>
										<div className="p-4 space-y-2">
											<div className="flex gap-2 items-start">
												<Field className="flex-1 gap-0.5">
													<Input
														value={account.accountName}
														placeholder="Enter account name"
														onChange={(e) =>
															handleChange(index, "accountName", e.target.value)
														}
														className="font-bold"
													/>
													<FieldDescription>Account Name</FieldDescription>
												</Field>
												<Field className="flex-1 gap-0.5">
													<Input
														type="date"
														value={account.startDate ?? "hi"}
														onChange={(e) =>
															handleChange(index, "startDate", e.target.value)
														}
													/>
													<FieldDescription>Start Date</FieldDescription>
												</Field>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleChange(index, "inactive", !account.inactive)
													}
													className="mt-0.5"
												>
													{!account.inactive ? (
														<Eye className="h-4 w-4 text-secondary" />
													) : (
														<EyeOff className="h-4 w-4 text-primary" />
													)}
												</Button>
											</div>
											<div className="flex gap-2 items-start">
												<Field className="flex-1 gap-0.5">
													<Input
														value={account.monarchId}
														placeholder="Enter Monarch ID"
														onChange={(e) =>
															handleChange(index, "monarchId", e.target.value)
														}
													/>
													<FieldDescription>Monarch ID</FieldDescription>
												</Field>
												<Field className="flex-1 gap-0.5">
													<Input
														value={account.splitwiseId}
														placeholder="Enter Splitwise ID"
														onChange={(e) =>
															handleChange(index, "splitwiseId", e.target.value)
														}
													/>
													<FieldDescription>Splitwise ID</FieldDescription>
												</Field>
												<Button
													variant="ghost"
													size="sm"
													className="mt-0.5"
													onClick={() => handleDelete(index)}
												>
													<Trash2 className="h-4 w-4 text-primary" />
												</Button>
											</div>
										</div>
										{index < tempAccounts.length - 1 && <Separator />}
									</div>
								))
							)}
						</div>
					</div>
				</div>
				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						className="text-primary"
						onClick={() => exitSettings(false)}
					>
						Cancel
					</Button>
					<Button variant="secondary" onClick={() => exitSettings(true)}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
