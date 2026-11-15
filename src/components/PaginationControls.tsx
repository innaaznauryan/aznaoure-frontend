import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
};

export const PaginationControls = ({
                                     currentPage,
                                     totalPages,
                                     goToPage,
                                     nextPage,
                                     prevPage,
                                   }: Props) => {
  return (
    <Pagination className="mt-6">
      <PaginationPrevious
        onClick={prevPage}
        className={`cursor-pointer ${
          currentPage === 1 ? "pointer-events-none opacity-50" : ""
        }`}
      />

      <PaginationContent>
        {Array.from({ length: totalPages }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i + 1}
              className={`cursor-pointer ${
                currentPage === i + 1 ? "pointer-events-none" : ""
              }`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
      </PaginationContent>

      <PaginationNext
        onClick={nextPage}
        className={`cursor-pointer ${
          currentPage === totalPages ? "pointer-events-none opacity-50" : ""
        }`}
      />
    </Pagination>
  );
};