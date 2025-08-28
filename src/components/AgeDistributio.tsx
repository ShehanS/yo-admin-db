import React, {FC, useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Card, CardContent} from "@mui/joy";
import {useQuery} from "@apollo/client";
import {GET_FIND_AGE_DISTRIBUTION} from "../graphql/queries";
import {ResponseMessage} from "../data/data";


const AgeDistribution: FC = () => {
    const {data, loading, error} = useQuery(GET_FIND_AGE_DISTRIBUTION)
    const [graphData, setGraphData] = useState<{ ageRange: string, percentage: number, count: number }[]>([]);

    useEffect(() => {
        const response = data?.findAgeDistributionWithPercentage as ResponseMessage;
        if (response?.code === "CODE-4006") {
            setGraphData(response?.data)
        }
    }, [data])

    const colors = ['#ff4444', '#ff4444', '#ff4444', '#ff4444', '#ff4444'];

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{margin: 0, fontWeight: 'bold'}}>{`Age: ${label}`}</p>
                    <p style={{margin: 0}}>{`Count: ${dataPoint.count}`}</p>
                    <p style={{margin: 0}}>{`Percentage: ${dataPoint.percentage.toFixed(2)}%`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardContent>
                <div style={{width: '100%', height: '400px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={graphData}
                            margin={{top: 5, right: 30, left: 100, bottom: 40}}
                        >
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis
                                type="number"
                                domain={[0, Math.max(...graphData.map(d => d.percentage)) * 1.1]}
                                tickFormatter={(value) => `${value}%`}
                                label={{value: 'Percent of Population', position: 'insideBottom', offset: -10}}
                            />
                            <YAxis
                                type="category"
                                dataKey="ageRange"
                                width={120}
                                label={{value: 'Age Group', angle: -90, position: 'insideLeft'}}
                            />
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="percentage" barSize={30}>
                                {graphData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]}/>
                                ))}
                            </Bar>
                        </BarChart>

                    </ResponsiveContainer>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px',
                    marginTop: '15px'
                }}>
                    {graphData?.map((item, index) => (
                        <div key={item?.ageRange}
                             style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px'}}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: colors[index % colors.length],
                                borderRadius: '2px'
                            }}/>
                            <span>{item?.ageRange}: {item?.percentage.toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AgeDistribution;
