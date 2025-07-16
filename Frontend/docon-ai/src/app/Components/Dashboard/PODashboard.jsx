// components/DashboardContent.jsx
import React from 'react';

export default function DashboardContent() {
  return (
    <div className="p-8">
      {/* Projects Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-[#166394] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg text-center shadow">
            <p className="text-4xl font-bold text-[#166394]">15</p>
            <p className="text-gray-600">In progress</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg text-center shadow">
            <p className="text-4xl font-bold text-[#166394]">05</p>
            <p className="text-gray-600">Upcoming</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg text-center shadow">
            <p className="text-4xl font-bold text-[#166394]">04</p>
            <p className="text-gray-600">Completed</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center shadow">
            <p className="text-4xl font-bold text-[#166394]">24</p>
            <p className="text-gray-600">Total</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-4 text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
          </svg>
          Delayed Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Project Card 1: Hotel Taj */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg text-gray-800">Hotel Taj</h4>
              <span className="text-sm text-gray-500">#P000120</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              40 Documents
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Progress: 50%</span>
              <span>123 Days Left</span>
            </div>
          </div>

          {/* Project Card 2: Beach Bay */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg text-gray-800">Beach Bay</h4>
              <span className="text-sm text-gray-500">#P000121</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              21 Documents
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '21%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Progress: 21%</span>
              <span>181 Days Left</span>
            </div>
          </div>

          {/* Project Card 3: Vehicle Park */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-lg text-gray-800">Vehicle Park</h4>
              <span className="text-sm text-gray-500">#P000129</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              57 Documents
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '83%' }}></div>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Progress: 83%</span>
              <span>30 Days Left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-[#166394] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Recent Uploads
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {/* Upload Card 1: Cost Estimation */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/cost-estimation.png" alt="Cost Estimation" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Cost Estimation</p>
          </div>
          {/* Upload Card 2: Contract */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/contract.png" alt="Contract" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Contract</p>
          </div>
          {/* Upload Card 3: Environment Report */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/environment-report.png" alt="Environment Report" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Environment Report</p>
          </div>
          {/* Upload Card 4: Beach House design */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/beach-house-design.png" alt="Beach House Design" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Beach House design</p>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-[#166394] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 2v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Reports
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {/* Report Card 1: Cost Report */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/cost-report.png" alt="Cost Report" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Cost Report</p>
          </div>
          {/* Report Card 2: Contract Report */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/contract-report.png" alt="Contract Report" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Contract Report</p>
          </div>
          {/* Report Card 3: Penthouse cost Report */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/penthouse-cost-report.png" alt="Penthouse Cost Report" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Penthouse cost Report</p>
          </div>
          {/* Report Card 4: Beach Report */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/beach-report.png" alt="Beach Report" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Beach Report</p>
          </div>
        </div>
      </div>

      {/* Recent Comparisons Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-[#166394] flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Recent Comparisons
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {/* Comparison Card 1: Cost Comparison */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/cost-comparison.png" alt="Cost Comparison" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Cost Comparison</p>
          </div>
          {/* Comparison Card 2: Contract Comparison */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/contract-comparison.png" alt="Contract Comparison" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Contract Comparison</p>
          </div>
          {/* Comparison Card 3: Environment Comparison */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/environment-comparison.png" alt="Environment Comparison" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">Environment Comparison</p>
          </div>
          {/* Comparison Card 4: BOI Comparison */}
          <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg shadow-sm">
            <img src="/icons/boi-comparison.png" alt="BOI Comparison" className="h-16 w-16 mb-2" />
            <p className="text-center text-gray-700 font-medium">BOI Comparison</p>
          </div>
        </div>
      </div>
    </div>
  );
}