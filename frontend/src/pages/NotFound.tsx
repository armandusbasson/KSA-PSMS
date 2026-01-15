import React from 'react';
import { Card, Button } from '../components/Common';

export const NotFound: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Page not found</p>
        <a href="/">
          <Button>Go to Dashboard</Button>
        </a>
      </Card>
    </div>
  );
};
