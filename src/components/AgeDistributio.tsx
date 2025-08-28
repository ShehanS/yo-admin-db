import React, {FC, useEffect, useState} from "react";
import {Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {Card, CardContent, Typography} from "@mui/joy";
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

    // Colorful scheme for better data visualization
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '10px',
                    border: '1px solid #333333',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(255,255,255,0.1)',
                    color: '#ffffff'
                }}>
                    <p style={{margin: 0, fontWeight: 'bold', color: '#ffffff'}}>{`Age: ${label}`}</p>
                    <p style={{margin: 0, color: '#cccccc'}}>{`Count: ${dataPoint.count}`}</p>
                    <p style={{margin: 0, color: '#cccccc'}}>{`Percentage: ${dataPoint.percentage.toFixed(2)}%`}</p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                <CardContent>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px'
                    }}>
                        <Typography sx={{ color: '#ffffff' }}>Loading age distribution data...</Typography>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                <CardContent>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px'
                    }}>
                        <Typography sx={{ color: '#f44336' }}>
                            Error loading data: {error.message}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{
            backgroundColor: '#000000',
            border: '1px solid #333333',
            boxShadow: 'none'
        }}>
            <CardContent>
                <div style={{width: '100%', height: '400px'}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={graphData}
                            margin={{top: 5, right: 30, left: 100, bottom: 40}}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#333333"
                                horizontal={true}
                                vertical={true}
                            />
                            <XAxis
                                type="number"
                                domain={[0, Math.max(...graphData.map(d => d.percentage)) * 1.1]}
                                tickFormatter={(value) => `${value}%`}
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={{ stroke: '#666666' }}
                                tickLine={{ stroke: '#666666' }}
                                label={{
                                    value: 'Percent of Population',
                                    position: 'insideBottom',
                                    offset: -10,
                                    style: { textAnchor: 'middle', fill: '#ffffff' }
                                }}
                            />
                            <YAxis
                                type="category"
                                dataKey="ageRange"
                                width={120}
                                tick={{ fill: '#ffffff', fontSize: 12 }}
                                axisLine={{ stroke: '#666666' }}
                                tickLine={{ stroke: '#666666' }}
                                label={{
                                    value: 'Age Group',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fill: '#ffffff' }
                                }}
                            />
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar
                                dataKey="percentage"
                                barSize={30}
                                stroke="#333333"
                                strokeWidth={1}
                            >
                                {graphData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={colors[index % colors.length]}
                                        stroke="#333333"
                                        strokeWidth={1}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #333333'
                }}>
                    {graphData?.map((item, index) => (
                        <div key={item?.ageRange}
                             style={{
                                 display: 'flex',
                                 alignItems: 'center',
                                 gap: '8px',
                                 fontSize: '13px',
                                 padding: '8px',
                                 backgroundColor: '#2a2a2a',
                                 borderRadius: '4px',
                                 border: '1px solid #444444'
                             }}>
                            <div style={{
                                width: '14px',
                                height: '14px',
                                backgroundColor: colors[index % colors.length],
                                borderRadius: '2px',
                                border: colors[index % colors.length] === '#ffffff' ? '1px solid #666666' : '1px solid #333333',
                                flexShrink: 0
                            }}/>
                            <span style={{ color: '#ffffff', fontWeight: '500' }}>
                                {item?.ageRange}: {item?.percentage.toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AgeDistribution;
