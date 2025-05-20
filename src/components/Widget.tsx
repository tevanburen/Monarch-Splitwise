import { Divider, Paper, Stack, styled } from '@mui/material';
import { useLocalStorageContext } from '@/components';
import { usePageContext } from '@/api';
import { tmpDriver } from '@/methods';
import { AccountRows } from './AccountRows';
import { TitleUpload } from './TitleUpload';
import { useState } from 'react';

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
  const { tvbAccounts } = useLocalStorageContext();

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});

  const processFiles = async (files: File[]) => {
    if (!authToken) return;
    const response = await tmpDriver(files, tvbAccounts, authToken);
    setCompletedMap(response);
  };

  return (
    <StyledWidget elevation={3}>
      <Stack spacing={1}>
        <TitleUpload id={widgetInputId} onUpload={processFiles} />
        <Divider />
        <AccountRows completedMap={completedMap} />
      </Stack>
    </StyledWidget>
  );
};
