import React, {FC, useEffect, useState} from "react";
import { Card, CardContent, Typography } from '@mui/joy';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {useQuery} from "@apollo/client";
import {GET_MALE_VS_FEMALE} from "../graphql/queries";
import {ResponseMessage} from "../data/data";

// Type definitions for the tooltip and legend props
interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: {
            name: string;
            value: number;
            color: string;
        };
    }>;
}

interface LegendProps {
    payload?: Array<{
        value: string;
        color: string;
    }>;
}

const MaleVsFemale: FC = () => {
    const {data, loading, error} = useQuery(GET_MALE_VS_FEMALE)
    const [genderData, setGenderData] = useState([
        { name: 'Male', value: 0, color: '#3B82F6' },
        { name: 'Female', value: 0, color: '#EC4899' }
    ]);

    useEffect(() => {
        const response = data?.findMaleVsFemail as ResponseMessage;
        if(response?.code === "CODE-4005"){
            const apiData = response.data;
            setGenderData([
                { name: 'Male', value: parseInt(apiData.male), color: '#3B82F6' },
                { name: 'Female', value: parseInt(apiData.female), color: '#EC4899' }
            ]);
        }
    }, [data])

    const CustomTooltip: FC<TooltipProps> = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const totalCount = genderData[0].value + genderData[1].value;
            return (
                <div style={{
                    backgroundColor: '#1a1a1a',
                    padding: '8px 12px',
                    border: '1px solid #333333',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(255,255,255,0.1)',
                    color: '#ffffff'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#ffffff' }}>{data.name}</p>
                    <p style={{ margin: 0, color: data.payload.color }}>
                        Count: {data.value}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#cccccc' }}>
                        {totalCount > 0 ? ((data.value / totalCount) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend: FC<LegendProps> = ({ payload }) => {
        if (!payload) return null;

        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: entry.color,
                                borderRadius: '50%',
                                border: entry.color === '#ffffff' ? '1px solid #333333' : 'none'
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#ffffff' }}>
                            {entry.value}: {genderData.find(d => d.name === entry.value)?.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <Card sx={{ backgroundColor: '#1a1a1a', border: '1px solid #333333' }}>
                <CardContent>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '300px'
                    }}>
                        <Typography sx={{ color: '#ffffff' }}>Loading gender data...</Typography>
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
                        height: '300px'
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
        <React.Fragment>
            <Card sx={{
                backgroundColor: '#000000',
                border: '1px solid #333333',
                boxShadow: 'none'
            }}>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={genderData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="#333333"
                                strokeWidth={1}
                            >
                                {genderData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="#333333"
                                        strokeWidth={1}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '30px',
                        marginTop: '15px',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    }}>
                        <div style={{
                            color: '#ffffff',
                            padding: '8px 16px',
                            backgroundColor: '#2a2a2a',
                            borderRadius: '4px',
                            border: '1px solid #444444'
                        }}>
                            Male: {genderData[0].value}
                        </div>
                        <div style={{
                            color: '#ffffff',
                            padding: '8px 16px',
                            backgroundColor: '#2a2a2a',
                            borderRadius: '4px',
                            border: '1px solid #444444'
                        }}>
                            Female: {genderData[1].value}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </React.Fragment>
    );
}

export default MaleVsFemale;
