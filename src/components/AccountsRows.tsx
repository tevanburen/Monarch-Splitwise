import { Skeleton, Stack, Typography } from '@mui/material';
import { useLocalStorageContext } from './LocalStorageProvider';
import { CancelRounded, CheckCircleRounded } from '@mui/icons-material';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';

export interface AccountsRowsProps {
  completedMap: Record<string, boolean>;
}

export const AccountRows = ({ completedMap }: AccountsRowsProps) => {
  const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
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
            <Stack
              key={account.monarchId}
              direction="row"
              alignItems="center"
              spacing={1}
              onClick={() => setIsSettingsModalOpen(true)}
            >
              {completedMap[account.monarchId] ? (
                <CheckCircleRounded color="success" fontSize="small" />
              ) : (
                <CancelRounded color="error" fontSize="small" />
              )}
              <Typography>{account.monarchName}</Typography>
            </Stack>
          ))}
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </Stack>
  );
};
