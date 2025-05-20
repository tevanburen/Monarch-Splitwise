import { Skeleton, Stack, styled, Typography } from '@mui/material';
import { useLocalStorageContext } from './LocalStorageProvider';
import { CancelRounded, CheckCircleRounded } from '@mui/icons-material';

export interface AccountsRowsProps {
  completedMap: Record<string, boolean>;
  openSettingsModal: () => void;
}

const CursorStack = styled(Stack)({
  cursor: 'pointer',
});

export const AccountRows = ({
  completedMap,
  openSettingsModal,
}: AccountsRowsProps) => {
  const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();

  return (
    <Stack>
      {isLocalStorageLoading
        ? [1, 2].map((el) => (
            <Stack key={el} direction="row" spacing={1}>
              <CancelRounded color="disabled" fontSize="small" />
              <Typography>
                <Skeleton width={80} />
              </Typography>
            </Stack>
          ))
        : tvbAccounts.map((account) => (
            <CursorStack
              key={account.monarchId}
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={openSettingsModal}
            >
              {completedMap[account.monarchId] ? (
                <CheckCircleRounded color="success" fontSize="small" />
              ) : (
                <CancelRounded color="error" fontSize="small" />
              )}
              <Typography>{account.monarchName}</Typography>
            </CursorStack>
          ))}
    </Stack>
  );
};
