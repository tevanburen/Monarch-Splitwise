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
import { useEffect, useState } from 'react';
import { TvbAccount } from '@/types';
import { SettingsModalRow } from './SettingsModalRow';
import { AddRounded } from '@mui/icons-material';
import { Dayjs } from 'dayjs';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type TvbAccountWithRowKey = TvbAccount & { rowKey: number };
let rowKey = 0;

export const SettingsModal = ({ open, onClose }: SettingsModalProps) => {
  const { tvbAccounts, isLocalStorageLoading, setLocalStorage } =
    useLocalStorageContext();

  const [currentAccounts, setCurrentAccounts] = useState<
    TvbAccountWithRowKey[]
  >([]);

  useEffect(() => {
    if (open) {
      setCurrentAccounts(
        tvbAccounts.map((row) => ({ ...row, rowKey: rowKey++ }))
      );
    }
  }, [tvbAccounts, open]);

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
              setLocalStorage('tvbAccounts', currentAccounts);
              onClose();
            }}
            size="small"
            disabled={currentAccounts.some(
              (row) => !(row.monarchId && row.monarchName && row.splitwiseName)
            )}
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
          <Stack spacing={1}>
            {currentAccounts.map((row, index) => (
              <Stack spacing={2} key={row.rowKey} paddingTop={1}>
                <SettingsModalRow
                  updateTvbAccount={(
                    field: keyof TvbAccount,
                    value: string | Dayjs | null
                  ) =>
                    setCurrentAccounts((prev) => {
                      const newRows = [...prev];
                      newRows[index] = { ...newRows[index], [field]: value };
                      return newRows;
                    })
                  }
                  tvbAccount={row}
                  deleteAccount={() => {
                    setCurrentAccounts((prev) => {
                      const newRows = [...prev];
                      newRows.splice(index, 1);
                      return newRows;
                    });
                  }}
                />
                <Divider />
              </Stack>
            ))}
            <div>
              <Button
                variant="text"
                startIcon={<AddRounded />}
                size="small"
                onClick={() => {
                  const newKey = rowKey++;
                  setCurrentAccounts((prev) => [
                    ...prev,
                    {
                      monarchId: '',
                      monarchName: '',
                      splitwiseName: '',
                      rowKey: newKey,
                      startDate: null,
                    },
                  ]);
                }}
              >
                Add account
              </Button>
            </div>
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
};
