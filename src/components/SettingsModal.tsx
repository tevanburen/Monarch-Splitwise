import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useLocalStorageContext } from './LocalStorageProvider';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { isLocalStorageLoading } = useLocalStorageContext();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Stack padding={1} spacing={1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">Settings</Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              onClose();
            }}
            size="small"
          >
            Save
          </Button>
        </Stack>
        <Divider />
        {isLocalStorageLoading ? (
          <Box
            height="64px"
            width="100%"
            alignItems="center"
            justifyContent="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        ) : (
          <div>Hi</div>
        )}
      </Stack>
    </Dialog>
  );
};
