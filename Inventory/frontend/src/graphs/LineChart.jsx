import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { ResponsiveLine } from '@nivo/line';

const LineChart =() => {
    const [salesData, setSalesData] = useState([]);

    const fetchSalesData = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/sales-data');
            setSalesData(response.data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    if (salesData.length === 0) {
        return <div>No sales data available.</div>;
    }

  return (
    <ResponsiveLine
        data={salesData}
        theme={{
            axis: {
              domain: {
                line: {
                  stroke: '#ffffff',
                },
              },
              legend: {
                text: {
                  fill: '#ffffff',
                },
              },
              ticks: {
                line: {
                  stroke: '#ffffff',
                  strokeWidth: 1,
                },
                text: {
                  fill: '#ffffff',
                },
              },
            },
            legends: {
              text: {
                fill: '#ffffff',
              },
            },
        }}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        curve="monotoneX"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: undefined,
            legendOffset: 36,
            legendPosition: 'middle',
            tickTextColor: '#ffffff',
            truncateTickAt: 10
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: undefined,
            legendOffset: -40,
            legendPosition: 'middle',
            tickTextColor: 'white',
            truncateTickAt: 0
        }}
        enableGridX={false}
        enableGridY={false}
        colors={['#ddbb68']}
        lineWidth={3}
        pointSize={9}
        pointColor={{ from: 'color', modifiers: [] }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabel="data.yFormatted"
        pointLabelYOffset={-12}
        enableArea={true}
        areaBlendMode="hard-light"
        enableTouchCrosshair={true}
        useMesh={true}
        legends={[]}
        motionConfig={{
            mass: 1,
            tension: 170,
            friction: 26,
            clamp: false,
            precision: 0.01,
            velocity: 0
        }}
    />
  )
}

export default LineChart;