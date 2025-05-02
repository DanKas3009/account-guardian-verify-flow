
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ValidatedAccount, AccountStatus } from "@/types/validation";
import { Badge } from "@/components/ui/badge";

interface AccountsTableProps {
  accounts: ValidatedAccount[];
}

const AccountsTable: React.FC<AccountsTableProps> = ({ accounts }) => {
  const [filter, setFilter] = useState<AccountStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter accounts based on status and search
  const filteredAccounts = accounts.filter((account) => {
    const matchesStatus = filter === "all" || account.status === filter;
    const matchesSearch =
      search === "" ||
      account.accountNumber.toLowerCase().includes(search.toLowerCase()) ||
      account.bankCode.toLowerCase().includes(search.toLowerCase()) ||
      (account.accountName &&
        account.accountName.toLowerCase().includes(search.toLowerCase())) ||
      (account.errorCode &&
        account.errorCode.toLowerCase().includes(search.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAccounts = filteredAccounts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-64">
          <Input
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filter === "all" ? "All Accounts" : `${filter} Accounts`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setFilter("all")}>
              All Accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("valid")}>
              Valid Accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("invalid")}>
              Invalid Accounts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilter("unknown")}>
              Unknown Accounts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Bank Code</TableHead>
              <TableHead className="hidden md:table-cell">Account Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Error Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAccounts.length > 0 ? (
              paginatedAccounts.map((account) => (
                <TableRow key={account.accountNumber + account.bankCode}>
                  <TableCell className="font-mono">{account.accountNumber}</TableCell>
                  <TableCell>{account.bankCode}</TableCell>
                  <TableCell className="hidden md:table-cell">{account.accountName || "—"}</TableCell>
                  <TableCell>
                    <AccountStatusBadge status={account.status} />
                  </TableCell>
                  <TableCell>
                    {account.errorCode ? (
                      <div>
                        <div className="font-medium text-sm">{account.errorCode}</div>
                        <div className="text-xs text-gray-500">{account.errorMessage}</div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No accounts found matching the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredAccounts.length)} of{" "}
            {filteredAccounts.length} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AccountStatusBadgeProps {
  status: AccountStatus;
}

const AccountStatusBadge: React.FC<AccountStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800 border-green-300";
      case "invalid":
        return "bg-red-100 text-red-800 border-red-300";
      case "unknown":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVariant()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default AccountsTable;
