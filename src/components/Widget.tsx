import { Button, Paper, styled, Typography } from '@mui/material';
import { FileUploadButton, useLocalStorageContext } from '@/components';
import { usePageContext } from '@/api';
import { tmpDriver } from '@/methods';

export const widgetInputId = 'MonarchSplitwiseInput';

const StyledWidget = styled(Paper)(({ theme }) => ({
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  position: 'fixed',
  pointerEvents: 'auto',
  padding: theme.spacing(2),
}));

export const Widget = () => {
  const { authToken } = usePageContext();
  const { tvbAccounts, setLocalStorage } = useLocalStorageContext();

  console.log(tvbAccounts);

  return (
    <StyledWidget elevation={3}>
      <Typography>Hello world</Typography>
      <FileUploadButton
        onUpload={(files) => {
          if (authToken) tmpDriver(files, tvbAccounts, authToken);
        }}
        id={widgetInputId}
      />
      <Button
        onClick={() =>
          setLocalStorage('tvbAccounts', [
            {
              monarchName: 'The Upper',
              splitwiseName: 'The Upper',
              monarchId: '208836640834093863',
            },
          ])
        }
      >
        Hi
      </Button>
    </StyledWidget>
  );
};
