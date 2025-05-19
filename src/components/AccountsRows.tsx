import { Stack, Typography } from '@mui/material';
import { useLocalStorageContext } from './LocalStorageProvider';
import { CancelRounded, CheckCircleRounded } from '@mui/icons-material';

export interface AccountsRowsProps {
  completedMap: Record<string, boolean>;
}

export const AccountRows = ({ completedMap }: AccountsRowsProps) => {
  const { tvbAccounts } = useLocalStorageContext();
  return (
    <Stack>
      {tvbAccounts.map((account) => (
        <Stack
          key={account.monarchId}
          direction="row"
          alignItems="center"
          spacing={1}
        >
          {completedMap[account.monarchId] ? (
            <CheckCircleRounded color="success" fontSize="small" />
          ) : (
            <CancelRounded color="error" fontSize="small" />
          )}
          <Typography>{account.monarchName}</Typography>
        </Stack>
      ))}
    </Stack>
  );
};
