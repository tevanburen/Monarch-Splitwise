import {
	DeleteRounded,
	VisibilityOffRounded,
	VisibilityRounded,
} from "@mui/icons-material";
import { IconButton, Stack, styled, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { TvbAccount } from "@/types";

export interface SettingsModalRowProps {
	tvbAccount: TvbAccount;
	updateTvbAccount: (
		field: keyof TvbAccount,
		value: string | boolean | null,
	) => void;
	deleteAccount: () => void;
}

const WideDatePicker = styled(DatePicker)(({ theme }) => ({
	width: theme.spacing(36),
}));

const GrayInvisibleIcon = styled(VisibilityOffRounded)(({ theme }) => ({
	color: theme.palette.grey[500],
}));

export const SettingsModalRow = ({
	tvbAccount,
	deleteAccount,
	updateTvbAccount,
}: SettingsModalRowProps) => {
	return (
		<Stack spacing={1}>
			<Stack direction="row" alignItems="center" spacing={1}>
				<TextField
					label="Monarch name"
					size="small"
					value={tvbAccount.monarchName}
					fullWidth
					onChange={(e) => updateTvbAccount("monarchName", e.target.value)}
				/>
				<TextField
					label="Splitwise name"
					size="small"
					value={tvbAccount.splitwiseName}
					fullWidth
					onChange={(e) => updateTvbAccount("splitwiseName", e.target.value)}
				/>
				<IconButton
					size="small"
					onClick={() => updateTvbAccount("invisible", !tvbAccount.invisible)}
				>
					{tvbAccount.invisible ? (
						<GrayInvisibleIcon fontSize="small" />
					) : (
						<VisibilityRounded fontSize="small" color="success" />
					)}
				</IconButton>
				<IconButton size="small" onClick={deleteAccount}>
					<DeleteRounded fontSize="small" color="error" />
				</IconButton>
			</Stack>
			<Stack direction="row" alignItems="center" spacing={1}>
				<TextField
					label="Monarch ID"
					size="small"
					value={tvbAccount.monarchId}
					fullWidth
					onChange={(e) => updateTvbAccount("monarchId", e.target.value)}
				/>
				<WideDatePicker
					label="Start date"
					slotProps={{ textField: { size: "small" } }}
					value={tvbAccount.startDate ? dayjs(tvbAccount.startDate) : null}
					onChange={(newVal) =>
						updateTvbAccount("startDate", newVal?.format("YYYY-MM-DD") ?? null)
					}
				/>
			</Stack>
		</Stack>
	);
};
