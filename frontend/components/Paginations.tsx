import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button/Button";

type PaginationsProps = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Paginations({
  totalPages,
  currentPage,
  onPageChange,
}: PaginationsProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };
  return (
    <div>
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft />
      </Button>
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
