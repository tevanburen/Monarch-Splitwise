import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import type { TvbAccount } from "@/types";

export interface SettingsModalRowProps {
	tvbAccount: TvbAccount;
	updateTvbAccount: (
		field: keyof TvbAccount,
		value: string | boolean | null,
	) => void;
	deleteAccount: () => void;
}

export const SettingsModalRow = ({
	tvbAccount,
	deleteAccount,
	updateTvbAccount,
}: SettingsModalRowProps) => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-row items-center gap-2">
				<Input
					placeholder="Monarch name"
					className="flex-1"
					value={tvbAccount.monarchName}
					onChange={(e) => updateTvbAccount("monarchName", e.target.value)}
				/>
				<Input
					placeholder="Splitwise name"
					className="flex-1"
					value={tvbAccount.splitwiseName}
					onChange={(e) => updateTvbAccount("splitwiseName", e.target.value)}
				/>
				<Button
					variant="ghost"
					size="icon"
					onClick={() => updateTvbAccount("invisible", !tvbAccount.invisible)}
				>
					{tvbAccount.invisible ? (
						<EyeOff className="size-4 text-muted-foreground" />
					) : (
						<Eye className="size-4 text-secondary" />
					)}
				</Button>
				<Button variant="ghost" size="icon" onClick={deleteAccount}>
					<Trash2 className="size-4 text-primary" />
				</Button>
			</div>
			<div className="flex flex-row items-center gap-2">
				<Input
					placeholder="Monarch ID"
					className="flex-1"
					value={tvbAccount.monarchId}
					onChange={(e) => updateTvbAccount("monarchId", e.target.value)}
				/>
				<Input
					type="date"
					placeholder="Start date"
					className="flex-1"
					value={tvbAccount.startDate ?? ""}
					onChange={(e) =>
						updateTvbAccount("startDate", e.target.value || null)
					}
				/>
			</div>
		</div>
	);
};
