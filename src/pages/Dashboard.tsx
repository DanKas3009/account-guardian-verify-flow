
import React from "react";
import NavLayout from "@/components/layout/NavLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <NavLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2">PesaLink Account Validation</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Validate bulk bank accounts before processing transactions to prevent AC-01 errors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Validate Accounts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Validate Accounts</CardTitle>
              <CardDescription>
                Upload a file with bank accounts to validate them in bulk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Support for CSV, JSON, and XML formats. Validate thousands of accounts at once.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/validate">Start Validation</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* View History Card */}
          <Card>
            <CardHeader>
              <CardTitle>View History</CardTitle>
              <CardDescription>
                Access previous validation results and reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Review past validations, download reports, and track error patterns.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/history">View History</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Documentation Card */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Learn how to use the validation system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">
                Explore our guides, API docs, and file format requirements.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link to="/docs">View Docs</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pesalink-100 text-pesalink-600 h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="font-medium text-lg mb-2">Upload File</h3>
              <p className="text-gray-600">Upload a CSV, JSON, or XML file containing bank account details.</p>
            </div>
            <div className="text-center">
              <div className="bg-pesalink-100 text-pesalink-600 h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="font-medium text-lg mb-2">Validation Process</h3>
              <p className="text-gray-600">Our system checks account formats and validates them with bank APIs.</p>
            </div>
            <div className="text-center">
              <div className="bg-pesalink-100 text-pesalink-600 h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="font-medium text-lg mb-2">Get Results</h3>
              <p className="text-gray-600">Review detailed reports and export valid accounts for processing.</p>
            </div>
          </div>
        </div>
      </div>
    </NavLayout>
  );
};

export default Dashboard;
