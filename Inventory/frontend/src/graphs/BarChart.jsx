import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { ResponsiveBar } from '@nivo/bar';

const BarChart = () => {
    const [topItems, setTopItems] = useState([]);

    const fetchTopItems = async () => {
        try {
            const topResponse = await axios.get('http://localhost:5001/api/top-items-dashboard');
            if (topResponse.status === 200) {
                setTopItems(topResponse.data);
            }
        } catch (error) {
            console.error(error.message)
        }
    };

    useEffect(() => {
        fetchTopItems();
    }, []);

    const chartData = topItems.map(item => ({
        item_description: item.item_description, 
        total_sales: item.total_sales 
    }));

    if (!Array.isArray(chartData) || chartData.length === 0) {
        return <div>No data available</div>; // Fallback for no data
    }

  return (
    <ResponsiveBar
        data={chartData}
        keys={['total_sales']}
        indexBy="item_description"
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
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        padding={0.2}
        maxValue={Math.max(...chartData.map(item => item.total_sales))}
        groupMode="grouped"
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={['#ddbb68']}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#38bcb2',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: '#eed312',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: {
                    id: 'fries'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'sandwich'
                },
                id: 'lines'
            }
        ]}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: undefined,
            legendPosition: 'middle',
            legendOffset: 32,
            truncateTickAt: 10
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: undefined,
            legendPosition: 'middle',
            legendOffset: -40,
            truncateTickAt: 0
        }}
        enableLabel={false}
        labelSkipWidth={11}
        labelSkipHeight={12}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1.6
                ]
            ]
        }}
        legends={[
            {
                dataFrom: 'keys',
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 2,
                itemWidth: 100,
                itemHeight: 20,
                itemDirection: 'left-to-right',
                itemOpacity: 0.85,
                symbolSize: 20,
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
        role="application"
        ariaLabel="Nivo bar chart demo"
        barAriaLabel={e=>e.id+": "+e.formattedValue+" in country: "+e.indexValue}
    />
  )
}

export default BarChart;