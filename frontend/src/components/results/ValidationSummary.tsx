
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ValidationSummary as ValidationSummaryType } from "@/types/validation";
import { Progress } from "@/components/ui/progress";

interface ValidationSummaryProps {
  summary: ValidationSummaryType;
}

const ValidationSummary: React.FC<ValidationSummaryProps> = ({ summary }) => {
  const validPercentage = (summary.valid / summary.total) * 100;
  const invalidPercentage = (summary.invalid / summary.total) * 100;
  const unknownPercentage = (summary.unknown / summary.total) * 100;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Validation Summary</h3>
        
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium">Total Accounts</span>
            <span className="font-semibold">{summary.total}</span>
          </div>
          
          <SummaryItem 
            label="Valid" 
            count={summary.valid} 
            percentage={validPercentage} 
            color="bg-green-500" 
          />
          
          <SummaryItem 
            label="Invalid" 
            count={summary.invalid} 
            percentage={invalidPercentage} 
            color="bg-red-500" 
          />
          
          <SummaryItem 
            label="Unknown" 
            count={summary.unknown} 
            percentage={unknownPercentage} 
            color="bg-gray-400" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

interface SummaryItemProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ label, count, percentage, color }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <div>
          <span className="font-medium">{count}</span>
          <span className="text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
        </div>
      </div>
      <Progress value={percentage} className={`h-2 ${color}`} />
    </div>
  );
};

export default ValidationSummary;
