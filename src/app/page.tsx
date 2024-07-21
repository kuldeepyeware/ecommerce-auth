/* eslint-disable @typescript-eslint/no-misused-promises */

"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "~/app/_components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
  PaginationEllipsis,
} from "~/app/_components/ui/pagination";
import { Label } from "~/app/_components/ui/label";
import { Checkbox } from "~/app/_components/ui/checkbox";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

  const {
    data: categoriesData,
    refetch,
    error,
    isLoading,
  } = api.user.getCategories.useQuery({ page: currentPage, pageSize });

  const generatePagination = () => {
    const siblingCount = 3;
    const totalPageNumbers = siblingCount * 2 + 3;

    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftRange = Array.from(
        { length: totalPageNumbers - 1 },
        (_, i) => i + 1,
      );
      return [...leftRange, PaginationEllipsis];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightRange = Array.from(
        { length: totalPageNumbers - 1 },
        (_, i) => totalPages - totalPageNumbers + i + 2,
      );
      return [1, PaginationEllipsis, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [
        1,
        PaginationEllipsis,
        ...middleRange,
        PaginationEllipsis,
        totalPages,
      ];
    }

    return [];
  };

  useEffect(() => {
    if (categoriesData?.total) {
      setTotalPages(Math.ceil(categoriesData.total / pageSize));
    }
  }, [categoriesData, pageSize]);

  const updateInterestsMutation = api.user.updateInterests.useMutation();

  const [userInterests, setUserInterests] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    if (categoriesData) {
      const interests = categoriesData.categories.reduce(
        (acc, category) => {
          acc[category.id] = category.isInterested;
          return acc;
        },
        {} as Record<string, boolean>,
      );
      setUserInterests(interests);
    }
  }, [categoriesData]);

  const handleCheckboxChange = (categoryId: string, isChecked: boolean) => {
    setUserInterests((prev) => ({ ...prev, [categoryId]: isChecked }));
    updateInterestsMutation.mutate(
      { categoryId, interested: isChecked },
      {
        onSuccess: () => refetch(),
      },
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <main className="mt-[40px] flex items-center justify-center px-[20px] md:ml-[100px] md:px-0">
      <Card className="w-full rounded-[20px] px-[30px] py-[10px] md:w-[576px]">
        <CardHeader className="text-center">
          <CardTitle className="text-[32px] font-semibold">
            Please mark your interests!
          </CardTitle>
          <CardDescription className="flex flex-col items-center justify-center pt-[23px] text-[16px] text-black">
            <span>We will keep you notified.</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: {error.message}</div>
          ) : (
            <>
              <div className="text-[20px] font-medium">My saved interests!</div>
              <div className="space-y-[23px]">
                {categoriesData?.categories.map((category) => (
                  <div
                    className="flex items-center gap-x-[12px]"
                    key={category.id}
                  >
                    <Checkbox
                      className="h-[24px] w-[24px] border-none bg-[#CCCCCC]"
                      id={category.id}
                      checked={!!userInterests[category.id]}
                      onCheckedChange={(checked) => {
                        handleCheckboxChange(category.id, checked as boolean);
                      }}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-base font-normal"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="mt-[34px] flex flex-col items-center">
          <Pagination className="flex max-w-[576px] cursor-pointer justify-center">
            <PaginationContent className="flex items-center space-x-1">
              <PaginationItem>
                <PaginationFirst
                  className="flex h-5 w-5 cursor-pointer items-center justify-center p-0 md:h-8 md:w-8"
                  onClick={() => handlePageChange(1)}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious
                  className="flex h-5 w-5 items-center justify-center p-0 md:h-8 md:w-8"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {generatePagination().map((pageNumber, index) => (
                <PaginationItem key={index}>
                  {pageNumber === PaginationEllipsis ? (
                    <PaginationEllipsis className="flex h-5 w-5 items-center justify-center p-0 md:h-8 md:w-8" />
                  ) : (
                    <PaginationLink
                      className={`flex h-5 w-5 items-center justify-center p-0 md:h-8 md:w-8 ${
                        currentPage === pageNumber
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      isActive={currentPage === pageNumber}
                      onClick={() => handlePageChange(pageNumber as number)}
                    >
                      {pageNumber as number}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  className="flex h-5 w-5 items-center justify-center p-0 md:h-8 md:w-8"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLast
                  className="flex h-5 w-5 items-center justify-center p-0 md:h-8 md:w-8"
                  onClick={() => handlePageChange(totalPages)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardFooter>
      </Card>
    </main>
  );
};

export default Home;
