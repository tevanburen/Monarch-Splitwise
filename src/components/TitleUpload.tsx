import { Typography } from "@mui/material";
import { FileAcceptor, type FileAcceptorProps } from "./library";

export type TitleUploadProps = FileAcceptorProps & { onClick?: () => void };

export const TitleUpload = ({ onClick, onUpload, id }: TitleUploadProps) => {
	return (
		<Typography
			component="label"
			style={{ cursor: "pointer" }}
			variant="h6"
			onClick={onClick}
		>
			<Typography color="primary" component="span" variant="h6">
				Monarch
			</Typography>
			{" - "}
			<Typography color="secondary" component="span" variant="h6">
				Splitwise
			</Typography>
			{!onClick && <FileAcceptor id={id} onUpload={onUpload} />}
		</Typography>
	);
};
