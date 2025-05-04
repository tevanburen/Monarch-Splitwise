import { Paper, styled, Typography } from '@mui/material';

const StyledWidget = styled(Paper)(({ theme }) => ({
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  position: 'fixed',
  pointerEvents: 'auto',
  padding: theme.spacing(2),
}));

export const Widget = () => {
  console.log('hello world');
  return (
    <StyledWidget elevation={3}>
      <Typography>Hello world</Typography>
    </StyledWidget>
  );
};
