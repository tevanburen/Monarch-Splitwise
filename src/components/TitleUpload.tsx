import { Typography } from '@mui/material';
import { FileAcceptor, FileAcceptorProps } from './library';

export type TitleUploadProps = FileAcceptorProps;

export const TitleUpload = ({ onUpload, id }: FileAcceptorProps) => {
  return (
    <Typography
      fontWeight="bold"
      component="label"
      style={{ cursor: 'pointer' }}
    >
      <Typography color="primary" component="span" fontWeight="bold">
        Monarch
      </Typography>
      {' - '}
      <Typography color="secondary" component="span" fontWeight="bold">
        Splitwise
      </Typography>
      <FileAcceptor id={id} onUpload={onUpload} />
    </Typography>
  );
};
