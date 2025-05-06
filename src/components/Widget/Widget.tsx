import { Paper, styled, Typography } from '@mui/material';
import { FileUploadButton } from '@/components';
import { tmpDriver } from './widget.methods';

const StyledWidget = styled(Paper)(({ theme }) => ({
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  position: 'fixed',
  pointerEvents: 'auto',
  padding: theme.spacing(2),
}));

export const Widget = () => {
  return (
    <StyledWidget elevation={3}>
      <Typography>Hello world</Typography>
      <FileUploadButton
        onUpload={(files) => {
          files.forEach(tmpDriver);
        }}
      />
    </StyledWidget>
  );
};
