import { Divider, Paper, Stack, styled } from '@mui/material';
import { useLocalStorageContext } from '@/components';
import { usePageContext } from '@/api';
import { tmpDriver } from '@/methods';
import { AccountRows } from './AccountsRows';
import { TitleUpload } from './TitleUpload';

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

  return (
    <StyledWidget elevation={3}>
      <Stack spacing={1}>
        <TitleUpload
          id={widgetInputId}
          onUpload={(files) => {
            if (authToken) tmpDriver(files, tvbAccounts, authToken);
          }}
        />
        <Divider />
        <AccountRows />
      </Stack>
    </StyledWidget>
  );
};
