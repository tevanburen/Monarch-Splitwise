import {
  Button,
  Divider,
  Paper,
  Stack,
  styled,
  Typography,
} from '@mui/material';
import { FileUploadButton, useLocalStorageContext } from '@/components';
import { usePageContext } from '@/api';
import { tmpDriver } from '@/methods';

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
  const { tvbAccounts, setLocalStorage } = useLocalStorageContext();

  console.log(tvbAccounts);

  return (
    <StyledWidget elevation={3}>
      <Stack spacing={1}>
        <Typography fontWeight="bold" component="span">
          <Typography color="primary" component="span" fontWeight="bold">
            Monarch
          </Typography>
          {' - '}
          <Typography color="secondary" component="span" fontWeight="bold">
            Splitwise
          </Typography>
        </Typography>
        <Divider />
        <FileUploadButton
          onUpload={(files) => {
            if (authToken) tmpDriver(files, tvbAccounts, authToken);
          }}
          id={widgetInputId}
        />
      </Stack>
    </StyledWidget>
  );
};
