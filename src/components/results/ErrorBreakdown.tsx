
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ValidatedAccount, ERROR_CODES } from "@/types/validation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface ErrorBreakdownProps {
  accounts: ValidatedAccount[];
}

const ErrorBreakdown: React.FC<ErrorBreakdownProps> = ({ accounts }) => {
  const invalidAccounts = accounts.filter(a => a.status === "invalid");
  
  const errorData = useMemo(() => {
    const errorCounts: Record<string, number> = {};
    
    invalidAccounts.forEach(account => {
      if (account.errorCode) {
        errorCounts[account.errorCode] = (errorCounts[account.errorCode] || 0) + 1;
      }
    });
    
    return Object.entries(errorCounts).map(([code, value]) => ({
      name: code,
      value,
      description: ERROR_CODES[code] || code
    }));
  }, [invalidAccounts]);
  
  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  if (invalidAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-3">Error Breakdown</h3>
          <p className="text-gray-500">No invalid accounts found.</p>
        </CardContent>
      </Card>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{item.name}</p>
          <p>{item.description}</p>
          <p className="text-gray-600">{`Count: ${item.value}`}</p>
          <p className="text-gray-600">{`${((item.value / invalidAccounts.length) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Error Breakdown</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={errorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {errorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">Error Types</h4>
          <ul className="space-y-1">
            {errorData.map((item, index) => (
              <li key={item.name} className="text-sm flex items-center gap-2">
                <span 
                  className="inline-block w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="font-medium">{item.name}</span> - {item.description}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorBreakdown;
