import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
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
				<Textarea
					placeholder="Monarch name"
					className="flex-1 min-h-9 resize-none"
					value={tvbAccount.monarchName}
					onChange={(e) => updateTvbAccount("monarchName", e.target.value)}
					rows={1}
				/>
				<Textarea
					placeholder="Splitwise name"
					className="flex-1 min-h-9 resize-none"
					value={tvbAccount.splitwiseName}
					onChange={(e) => updateTvbAccount("splitwiseName", e.target.value)}
					rows={1}
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
				<Textarea
					placeholder="Monarch ID"
					className="flex-1 min-h-9 resize-none"
					value={tvbAccount.monarchId}
					onChange={(e) => updateTvbAccount("monarchId", e.target.value)}
					rows={1}
				/>
				<Input
					type="date"
					placeholder="Start date"
					className="w-72"
					value={tvbAccount.startDate ?? ""}
					onChange={(e) =>
						updateTvbAccount("startDate", e.target.value || null)
					}
				/>
			</div>
		</div>
	);
};
