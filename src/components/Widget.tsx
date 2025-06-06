import { Divider, Paper, Stack, styled } from '@mui/material';
import { useLocalStorageContext } from './LocalStorageProvider';
import { useLoadingScreenContext } from './LoadingScreenProvider';
import { usePageContext } from '@/api';
import { driveAccount } from '@/methods';
import { AccountRows } from './AccountRows';
import { TitleUpload } from './TitleUpload';
import { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { TvbAccountStatus } from '@/types';

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
  const { toggleLoading } = useLoadingScreenContext();
  const { tvbAccounts, isLocalStorageLoading } = useLocalStorageContext();
  const isAccountsEmpty = !isLocalStorageLoading && !tvbAccounts.length;

  const [completedMap, setCompletedMap] = useState<
    Record<string, TvbAccountStatus>
  >({});
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  const processFiles = async (files: File[]) => {
    if (!authToken) return;
    const loadingKey = toggleLoading();
    for (const account of tvbAccounts) {
      const response = await driveAccount(account, files, authToken);
      setCompletedMap((prev) => ({
        ...prev,
        [account.monarchId]: response.attempted
          ? response
          : prev[account.monarchId],
      }));
    }
    toggleLoading(false, loadingKey);
  };

  return (
    <StyledWidget elevation={3}>
      <Stack spacing={1}>
        <TitleUpload
          id={widgetInputId}
          onUpload={processFiles}
          onClick={
            isAccountsEmpty ? () => setIsSettingsModalOpen(true) : undefined
          }
        />
        {!isAccountsEmpty && (
          <>
            <Divider />
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
