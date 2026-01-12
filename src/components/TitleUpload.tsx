import { FileAcceptor, type FileAcceptorProps } from "./library";

export type TitleUploadProps = FileAcceptorProps & { onClick?: () => void };

/**
 * Renders the title banner that doubles as a file upload trigger or settings button.
 * Displays "Monarch - Splitwise" branding with conditional interaction behavior.
 *
 * @component
 */
export const TitleUpload = ({ onClick, onUpload, id }: TitleUploadProps) => {
	const content = (
		<>
			<span className="text-primary">Monarch</span>
			{" - "}
			<span className="text-secondary">Splitwise</span>
		</>
	);

	if (onClick) {
		return (
			<button
				type="button"
				className="cursor-pointer text-lg font-semibold bg-transparent border-0 p-0"
				onClick={onClick}
			>
				{content}
			</button>
		);
	}

	return (
		<label htmlFor={id} className="cursor-pointer text-lg font-semibold">
			{content}
			<FileAcceptor id={id} onUpload={onUpload} />
		</label>
	);
};
