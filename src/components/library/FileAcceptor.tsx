import { styled } from '@mui/material';

export interface FileAcceptorProps {
  onUpload?: (files: File[]) => void | Promise<void>;
  id?: string;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const acceptedFileTypes: Record<string, string> = {
  'text/csv': 'csv',
};

export const FileAcceptor = ({ onUpload, id }: FileAcceptorProps) => {
  return (
    <VisuallyHiddenInput
      type="file"
      accept={Object.values(acceptedFileTypes)
        .map((ext) => `.${ext}`)
        .join(',')}
      onChange={(event) => {
        if (event.target.files && onUpload) {
          onUpload(
            Array.from(event.target.files).filter(
              (file) => acceptedFileTypes[file.type]
            )
          );
        }
        // reset the val, so we can technically upload same twice:
        event.target.value = '';
      }}
      multiple
      id={id}
    />
  );
};
