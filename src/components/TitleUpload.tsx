import { Typography } from '@mui/material';
import { FileAcceptor, FileAcceptorProps } from './library';

export type TitleUploadProps = FileAcceptorProps;

export const TitleUpload = ({ onUpload, id }: FileAcceptorProps) => {
  return (
    <Typography component="label" style={{ cursor: 'pointer' }} variant="h6">
      <Typography color="primary" component="span" variant="h6">
        Monarch
      </Typography>
      {' - '}
      <Typography color="secondary" component="span" variant="h6">
        Splitwise
      </Typography>
      <FileAcceptor id={id} onUpload={onUpload} />
    </Typography>
  );
};
