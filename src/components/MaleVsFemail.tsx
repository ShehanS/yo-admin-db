import React, {FC, useEffect, useState} from "react";
import { Card, CardContent, Typography } from '@mui/joy';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {useQuery} from "@apollo/client";
import {GET_MALE_VS_FEMALE} from "../graphql/queries";
import {ResponseMessage} from "../data/data";

const MaleVsFemail: FC = () => {
    const {data, loading, error} = useQuery(GET_MALE_VS_FEMALE)
    const [genderData, setGenderData] = useState([
        { name: 'Male', value: 0, color: '#3b82f6' },
        { name: 'Female', value: 0, color: '#ec4899' }
    ]);

    useEffect(() => {
        const response = data?.findMaleVsFemail as ResponseMessage;
        if(response?.code === "CODE-4005"){
            const apiData = response.data;
            setGenderData([
                { name: 'Male', value: parseInt(apiData.male), color: '#3b82f6' },
                { name: 'Female', value: parseInt(apiData.female), color: '#ec4899' }
            ]);
        }
    }, [data])

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const totalCount = genderData[0].value + genderData[1].value;
            return (
                <div style={{
                    backgroundColor: 'white',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
                    <p style={{ margin: 0, color: data.payload.color }}>
                        Count: {data.value}
                    </p>
                    <p style={{ margin: 0, fontSize: '12px' }}>
                        {totalCount > 0 ? ((data.value / totalCount) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLegend = ({ payload }) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                {payload.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: entry.color,
                                borderRadius: '50%'
                            }}
                        />
                        <span style={{ fontSize: '14px', color: '#666' }}>
                            {entry.value}: {genderData.find(d => d.name === entry.value)?.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Typography level="h4" sx={{mb: 2}}>Gender Distribution (Male vs Female)</Typography>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <Typography>Loading...</Typography>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Typography level="h4" sx={{mb: 2}}>Gender Distribution (Male vs Female)</Typography>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                        <Typography color="danger">Error loading data</Typography>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <React.Fragment>
            <Card>
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
                            >
                                {genderData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
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
                        <div style={{ color: '#3b82f6' }}>
                            Male: {genderData[0].value}
                        </div>
                        <div style={{ color: '#ec4899' }}>
                            Female: {genderData[1].value}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </React.Fragment>
    );
}

export default MaleVsFemail;
