import { Button, Paper, styled, Typography } from '@mui/material';
import { FileUploadButton, widgetInputId } from '@/components';
import { tmpDriver } from './widget.methods';
import { fetchMonarchRows, usePageContext } from '@/api';

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
          tmpDriver(files);
        }}
        id={widgetInputId}
      />
      <Button onClick={() => fetchMonarchRows(authToken ?? 'nope')}>
        fetch
      </Button>
    </StyledWidget>
  );
};
