import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../Config/FirebaseConfig';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function StorageGraph() {
  const { data: session } = useSession();
  const [fileStats, setFileStats] = useState({
    byType: [],
    byMonth: []
  });

  useEffect(() => {
    if (session) {
      fetchFileStats();
    }
  }, [session]);

  const fetchFileStats = async () => {
    try {
      const db = getFirestore(app);
      const filesQuery = query(
        collection(db, 'files'),
        where('createdBy', '==', session.user.email)
      );

      const filesSnapshot = await getDocs(filesQuery);
      const filesByType = {};
      const filesByMonth = {};

      filesSnapshot.forEach((doc) => {
        const file = doc.data();
        // Aggregate by type
        const type = file.type || 'other';
        if (!filesByType[type]) {
          filesByType[type] = { count: 0, size: 0 };
        }
        filesByType[type].count++;
        filesByType[type].size += file.size || 0;

        // Aggregate by month
        const date = new Date(file.modifiedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!filesByMonth[monthKey]) {
          filesByMonth[monthKey] = 0;
        }
        filesByMonth[monthKey] += file.size || 0;
      });

      // Format data for charts
      const typeData = Object.entries(filesByType).map(([type, data]) => ({
        name: type.toUpperCase(),
        value: Number((data.size / 1024 / 1024).toFixed(2))
, // Convert to MB
        count: data.count
      }));

      const monthData = Object.entries(filesByMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-6) // Last 6 months
        .map(([month, size]) => ({
          name: month,
          size: Math.round(size / 1024 / 1024) // Convert to MB
        }));

      setFileStats({
        byType: typeData,
        byMonth: monthData
      });
    } catch (error) {
      console.error('Error fetching file stats:', error);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="w-full">
      <h2 className="text-[17px] font-bold mb-6 px-2">Storage Analytics</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Storage Usage */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold mb-4">Monthly Storage Usage</h3>
          <div className="w-full h-[300px] overflow-visible">
            <BarChart 
              width={350} 
              height={250}
              data={fileStats.byMonth}
              margin={{ top: 20, right: 30, bottom: 40, left: 40 }}
            >
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
              <YAxis width={60} />
              <Tooltip />
              <Bar dataKey="size" fill="#8884d8" />
            </BarChart>
          </div>
        </div>

        {/* File Type Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold mb-4">Storage by File Type</h3>
          <div className="w-full h-[300px] overflow-visible">
            <PieChart width={400} height={250}>
              <Pie
                data={fileStats.byType}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={75}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name} (${value}MB)`}
                labelLine={{ strokeWidth: 1, stroke: '#666' }}
              >
                {fileStats.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} MB`, name]}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm" style={{ color: '#666' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 px-2">
        {fileStats.byType.map((type, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 truncate">{type.name}</h4>
            <p className="text-xl font-semibold mt-2">{type.count}</p>
            <p className="text-sm text-gray-500 mt-1">{type.value} MB</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StorageGraph;
