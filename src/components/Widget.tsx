import { Paper, styled, Typography } from '@mui/material';
import { FileUploadButton } from '@/components';
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

  return (
    <StyledWidget elevation={3}>
      <Typography>Hello world</Typography>
      <FileUploadButton
        onUpload={(files) => {
          if (authToken) tmpDriver(files, authToken);
        }}
        id={widgetInputId}
      />
    </StyledWidget>
  );
};
