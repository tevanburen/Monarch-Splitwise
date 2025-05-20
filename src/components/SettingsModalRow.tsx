import { TvbAccount } from '@/types';
import { DeleteRounded } from '@mui/icons-material';
import { IconButton, Stack, TextField } from '@mui/material';

export interface SettingsModalRowProps {
  tvbAccount: TvbAccount;
  updateTvbAccount: (field: keyof TvbAccount, value: string) => void;
  deleteAccount: () => void;
}

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
          onChange={(e) => updateTvbAccount('monarchName', e.target.value)}
        />
        <TextField
          label="Splitwise name"
          size="small"
          value={tvbAccount.splitwiseName}
          fullWidth
          onChange={(e) => updateTvbAccount('splitwiseName', e.target.value)}
        />
        <IconButton size="small" onClick={deleteAccount}>
          <DeleteRounded fontSize="small" color="error" />
        </IconButton>
      </Stack>
      <TextField
        label="Monarch ID"
        size="small"
        value={tvbAccount.monarchId}
        fullWidth
        onChange={(e) => updateTvbAccount('monarchId', e.target.value)}
      />
    </Stack>
  );
};
