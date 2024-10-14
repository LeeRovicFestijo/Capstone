import React, { useEffect, useState } from 'react'; 
import axios from 'axios';
import { ResponsivePie } from '@nivo/pie';
import { scaleLinear } from 'd3-scale';

const PieChart = () => {
    const [paymentModeSales, setPaymentModeSales] = useState([]);

    const fetchPaymentSales = async () => {
        try {
          const response = await axios.get('http://localhost:5001/api/sales-by-payment-mode');
          
          const transformedData = response.data.map(item => ({
            id: item.payment_mode,  // Assuming your API returns a field named `payment_method`
            label: item.payment_mode,
            value: item.total_sales  // Assuming your API returns a field named `total_sales`
        }));
        
        setPaymentModeSales(transformedData); 
        } catch (err) {
          console.error('Error fetching sales data:', err);
        }
    };

    useEffect(() => {
        fetchPaymentSales();
    }, []);

    if (paymentModeSales.length === 0) {
        return <div>No sales data available for this month.</div>;
    }

    const colorScale = scaleLinear()
        .domain([0, paymentModeSales.length - 1]) 
        .range(['#f2e0a2', '#ddbb68']); 


  return (
    <ResponsivePie
        data={paymentModeSales}
        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
        sortByValue={true}
        innerRadius={0.55}
        padAngle={1}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={['#DDBB68', '#B0974D', '#9A8640', '#C7A95B']}
        colorBy="index"
        borderWidth={3}
        borderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.2
                ]
            ]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor="white"
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        enableArcLabels={false}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    2
                ]
            ]
        }}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        fill={[
            {
                match: {
                    id: 'ruby'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'c'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'go'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'python'
                },
                id: 'dots'
            },
            {
                match: {
                    id: 'scala'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'lisp'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'elixir'
                },
                id: 'lines'
            },
            {
                match: {
                    id: 'javascript'
                },
                id: 'lines'
            }
        ]}
    />
  )
}

export default PieChart;