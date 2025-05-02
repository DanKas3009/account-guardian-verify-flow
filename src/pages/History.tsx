
import React, { useState } from "react";
import NavLayout from "@/components/layout/NavLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ValidationResult } from "@/types/validation";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

// Mock validation history data
const mockHistoryData: ValidationResult[] = [
  {
    jobId: "job-a1b2c3",
    timestamp: "2025-05-01T14:32:10Z",
    summary: { total: 120, valid: 98, invalid: 18, unknown: 4 },
    accounts: []
  },
  {
    jobId: "job-d4e5f6",
    timestamp: "2025-04-30T09:15:42Z",
    summary: { total: 85, valid: 72, invalid: 13, unknown: 0 },
    accounts: []
  },
  {
    jobId: "job-g7h8i9",
    timestamp: "2025-04-28T16:45:23Z",
    summary: { total: 250, valid: 190, invalid: 48, unknown: 12 },
    accounts: []
  }
];

const History: React.FC = () => {
  const [history] = useState<ValidationResult[]>(mockHistoryData);
  
  const getSuccessRate = (valid: number, total: number): string => {
    return ((valid / total) * 100).toFixed(1) + "%";
  };

  const getStatusBadge = (result: ValidationResult) => {
    const successRate = (result.summary.valid / result.summary.total) * 100;
    
    if (successRate >= 90) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (successRate >= 80) {
      return <Badge className="bg-emerald-500">Good</Badge>;
    } else if (successRate >= 70) {
      return <Badge className="bg-amber-500">Fair</Badge>;
    } else {
      return <Badge className="bg-red-500">Poor</Badge>;
    }
  };
  
  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Validation History</h1>
          <p className="text-gray-500 mt-1">
            View your previous account validation jobs and results.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Validations</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead className="hidden md:table-cell">Accounts</TableHead>
                  <TableHead className="hidden sm:table-cell">Success Rate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length > 0 ? (
                  history.map((result) => (
                    <TableRow key={result.jobId}>
                      <TableCell>
                        {format(new Date(result.timestamp), "MMM d, yyyy")}
                        <div className="text-xs text-gray-500 md:hidden">
                          {format(new Date(result.timestamp), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>{result.jobId}</TableCell>
                      <TableCell className="hidden md:table-cell">{result.summary.total}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getSuccessRate(result.summary.valid, result.summary.total)}
                      </TableCell>
                      <TableCell>{getStatusBadge(result)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/results/${result.jobId}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No validation history found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-gray-500 mb-4">Need to validate more accounts?</p>
          <Button asChild>
            <Link to="/validate">Start New Validation</Link>
          </Button>
        </div>
      </div>
    </NavLayout>
  );
};

export default History;
