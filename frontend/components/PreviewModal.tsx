import { Modal } from "./Modal";

type PreviewModalProps = {
  html: string;
  onClose: () => void;
  isOpen: boolean;
};

export function PreviewModal({ html, onClose, isOpen }: PreviewModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div>
        <h2>Preview</h2>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </Modal>
  );
}
