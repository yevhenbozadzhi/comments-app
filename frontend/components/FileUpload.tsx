type FileUploadProps = {
  file: File | null;
  onFileSelected: (file: File | null) => void;
};

export function FileUpload({ file, onFileSelected }: FileUploadProps) {
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onFileSelected(selected);
    } else {
      onFileSelected(null);
    }
  };
  return (
    <div>
      <input type="file" onChange={handleFileSelected} />
      {file && <p>{file.name}</p>}
    </div>
  );
}
