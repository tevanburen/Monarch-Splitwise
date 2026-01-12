export interface FileAcceptorProps {
	onUpload?: (files: File[]) => void | Promise<void>;
	id?: string;
}

const acceptedFileTypes: Record<string, string> = {
	"text/csv": "csv",
};

/**
 * Hidden file input component that accepts CSV files.
 * Filters uploaded files by type and resets the input after each selection.
 *
 * @component
 */
export const FileAcceptor = ({ onUpload, id }: FileAcceptorProps) => {
	return (
		<input
			className="sr-only"
			type="file"
			accept={Object.values(acceptedFileTypes)
				.map((ext) => `.${ext}`)
				.join(",")}
			onChange={(event) => {
				if (event.target.files && onUpload) {
					onUpload(
						Array.from(event.target.files).filter(
							(file) => acceptedFileTypes[file.type],
						),
					);
				}
				// reset the val, so we can technically upload same twice:
				event.target.value = "";
			}}
			multiple
			id={id}
		/>
	);
};
