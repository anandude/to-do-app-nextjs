import React from "react";

type PaginationProps = {
  currentPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;

};

const PaginationDemo: React.FC<PaginationProps> = ({ currentPage, onNextPage, onPreviousPage, }) => {
  return (
    <div className="flex justify-center mt-4">
      <button
        className=" px-4 py-2 mx-1 text-white bg-black rounded"
        onClick={onPreviousPage}
        // disabled={!hasPreviousPage}
      >
        Previous Page
      </button>
      <span className="px-4 py-2 mx-1">{currentPage}</span>
      <button
        className="px-4 py-2 mx-1 text-white bg-black rounded"
        onClick={onNextPage}
        // disabled={!hasNextPage}
      >
        Next Page
      </button>
    </div>
  );
};

export default PaginationDemo;