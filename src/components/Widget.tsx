import { Divider, Paper, Stack, styled } from '@mui/material';
import { useLocalStorageContext } from '@/components';
import { usePageContext } from '@/api';
import { driveAccount } from '@/methods';
import { AccountRows } from './AccountRows';
import { TitleUpload } from './TitleUpload';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';

export const widgetInputId = 'MonarchSplitwiseInput';

const StyledWidget = styled(Paper)(({ theme }) => ({
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  position: 'fixed',
  pointerEvents: 'auto',
  padding: theme.spacing(1),
}));

export const Widget = () => {
  const { authToken } = usePageContext();
  const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();
  const isAccountsEmpty = !isLocalStorageLoading && !tvbAccounts.length;

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  const processFiles = async (files: File[]) => {
    if (!authToken) return;
    for (const account of tvbAccounts) {
      const response = await driveAccount(account, files, authToken);
      setCompletedMap((prev) => ({
        ...prev,
        [account.monarchId]: prev[account.monarchId] || response,
      }));
    }
  };

  return (
    <StyledWidget elevation={3}>
      <Stack spacing={1}>
        <TitleUpload
          id={widgetInputId}
          onUpload={processFiles}
          onClick={
            isAccountsEmpty ? undefined : () => setIsSettingsModalOpen(true)
          }
        />
        {!isAccountsEmpty && (
          <>
            <Divider />{' '}
            <AccountRows
              completedMap={completedMap}
              openSettingsModal={() => setIsSettingsModalOpen(true)}
            />
          </>
        )}
      </Stack>
      <SettingsModal
        open={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </StyledWidget>
  );
};
