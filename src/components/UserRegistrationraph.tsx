import React, {FC, useEffect, useState} from "react";
import {Brush, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useLazyQuery} from "@apollo/client";
import {GET_USER_COUNT_30MIN_BUCKETS_IN_RANGE} from "../graphql/queries";
import {ResponseMessage, UserData5Min} from "../data/data";
import {Button, Dropdown, FormControl, FormLabel, Menu, MenuButton, MenuItem, Card, CardContent, Box, Typography} from "@mui/joy";
import {DateRangeRounded, KeyboardArrowDown, RefreshRounded} from "@mui/icons-material";

interface FormattedUserData {
    count: number;
    timestamp: number;
    formattedTime: string;
    formattedDate: string;
}

interface TimeRange {
    label: string;
    value: string;
    startTime: () => number;
    endTime: () => number;
}

const UserRegistrationGraph: FC = () => {
    const [loadData, {data, error, loading, refetch}] = useLazyQuery(GET_USER_COUNT_30MIN_BUCKETS_IN_RANGE);
    const [userCount, setUserCount] = useState<FormattedUserData[]>([]);
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>("7d");
    const [customStartDate, setCustomStartDate] = useState<string>("");
    const [customEndDate, setCustomEndDate] = useState<string>("");

    const timeRanges: TimeRange[] = [
        {
            label: "Last 1 Hour",
            value: "1h",
            startTime: () => Math.floor((Date.now() - 60 * 60 * 1000) / 1000),
            endTime: () => Math.floor(Date.now() / 1000)
        },
        {
            label: "Last 6 Hours",
            value: "6h",
            startTime: () => Math.floor((Date.now() - 6 * 60 * 60 * 1000) / 1000),
            endTime: () => Math.floor(Date.now() / 1000)
        },
        {
            label: "Last 24 Hours",
            value: "24h",
            startTime: () => Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000),
            endTime: () => Math.floor(Date.now() / 1000)
        },
        {
            label: "Last 7 Days",
            value: "7d",
            startTime: () => Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000),
            endTime: () => Math.floor(Date.now() / 1000)
        },
        {
            label: "Last 30 Days",
            value: "30d",
            startTime: () => Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            endTime: () => Math.floor(Date.now() / 1000)
        },
        {
            label: "Custom Range",
            value: "custom",
            startTime: () => customStartDate ? Math.floor(new Date(customStartDate).getTime() / 1000) : Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000),
            endTime: () => customEndDate ? Math.floor(new Date(customEndDate).getTime() / 1000) : Math.floor(Date.now() / 1000)
        }
    ];

    const getCurrentTimeRange = () => {
        return timeRanges.find(range => range.value === selectedTimeRange) || timeRanges[3];
    };

    const loadDataForTimeRange = () => {
        const currentRange = getCurrentTimeRange();
        loadData({
            variables: {
                startTime: currentRange.startTime(),
                endTime: currentRange.endTime()
            }
        });
    };

    useEffect(() => {
        if (selectedTimeRange !== "custom") {
            loadDataForTimeRange();
        }
    }, [selectedTimeRange]);

    useEffect(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setCustomEndDate(now.toISOString().slice(0, 16));
        setCustomStartDate(weekAgo.toISOString().slice(0, 16));

        // Load initial data for 7 days
        loadDataForTimeRange();
    }, []);

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        return {
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            }),
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            }),
            fullDate: date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        };
    };

    useEffect(() => {
        if (data) {
            const response = data?.getUserCount30MinuteBucketsInRange as ResponseMessage;
            if (response?.code === "CODE-013" && response?.data) {
                const formattedData = (response.data as UserData5Min[]).map(item => {
                    const formatted = formatTimestamp(item.timestamp);
                    return {
                        count: item.count,
                        timestamp: item.timestamp,
                        formattedTime: formatted.time,
                        formattedDate: formatted.fullDate
                    };
                });
                console.log(formattedData);
                setUserCount(formattedData);
            }
        }
    }, [data]);

    const handleRefresh = () => {
        refetch();
    };

    const handleTimeRangeChange = (newValue: string) => {
        setSelectedTimeRange(newValue);
    };

    const handleCustomDateChange = () => {
        if (selectedTimeRange === "custom") {
            loadDataForTimeRange();
        }
    };

    const CustomTooltip = ({active, payload, label}: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Box
                    sx={{
                        backgroundColor: '#1a1a1a',
                        p: 2,
                        border: '1px solid #333333',
                        borderRadius: 'sm',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                    }}
                >
                    <Typography level="body-sm" sx={{ color: '#ffffff', mb: 0.5 }}>
                        Time: {data.formattedDate}
                    </Typography>
                    <Typography level="title-sm" sx={{ color: '#3B82F6' }}>
                        Users: {data.count}
                    </Typography>
                </Box>
            );
        }
        return null;
    };

    return (
        <Card sx={{
            width: "100%",
            backgroundColor: '#000000',
            border: '1px solid #333333',
            boxShadow: 'none'
        }}>
            <CardContent>
                <Box sx={{ width: '100%', mb: 3 }}>
                    {/* Time Range Buttons */}
                    <Box sx={{ mb: 2 }}>
                        <Typography level="body-sm" sx={{ color: '#ffffff', mb: 1 }}>
                            Time Range
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            gap: 1,
                            flexWrap: 'wrap',
                            mb: 2
                        }}>
                            {timeRanges.slice(0, -1).map((range) => (
                                <Button
                                    key={range.value}
                                    size="sm"
                                    variant={selectedTimeRange === range.value ? "solid" : "outlined"}
                                    onClick={() => handleTimeRangeChange(range.value)}
                                    sx={{
                                        backgroundColor: selectedTimeRange === range.value ? '#ffffff' : 'transparent',
                                        color: selectedTimeRange === range.value ? '#000000' : '#ffffff',
                                        borderColor: '#444444',
                                        '&:hover': {
                                            backgroundColor: selectedTimeRange === range.value ? '#e6e6e6' : '#2a2a2a',
                                            borderColor: '#666666'
                                        }
                                    }}
                                >
                                    {range.label}
                                </Button>
                            ))}
                            <Button
                                size="sm"
                                variant={selectedTimeRange === "custom" ? "solid" : "outlined"}
                                onClick={() => handleTimeRangeChange("custom")}
                                sx={{
                                    backgroundColor: selectedTimeRange === "custom" ? '#ffffff' : 'transparent',
                                    color: selectedTimeRange === "custom" ? '#000000' : '#ffffff',
                                    borderColor: '#444444',
                                    '&:hover': {
                                        backgroundColor: selectedTimeRange === "custom" ? '#e6e6e6' : '#2a2a2a',
                                        borderColor: '#666666'
                                    }
                                }}
                            >
                                Custom Range
                            </Button>
                        </Box>
                    </Box>

                    {/* Custom Date Inputs - Show only when Custom is selected */}
                    {selectedTimeRange === "custom" && (
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'end',
                            gap: 2,
                            flexWrap: 'wrap',
                            mb: 2,
                            p: 2,
                            backgroundColor: '#1a1a1a',
                            borderRadius: 'sm',
                            border: '1px solid #333333'
                        }}>
                            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                                <FormLabel sx={{ color: '#ffffff' }}>Start Date & Time</FormLabel>
                                <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444444',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#ffffff',
                                        height: '36px'
                                    }}
                                />
                            </FormControl>
                            <FormControl sx={{ flex: 1, minWidth: 200 }}>
                                <FormLabel sx={{ color: '#ffffff' }}>End Date & Time</FormLabel>
                                <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#2a2a2a',
                                        border: '1px solid #444444',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        color: '#ffffff',
                                        height: '36px'
                                    }}
                                />
                            </FormControl>
                            <Button
                                onClick={handleCustomDateChange}
                                size="sm"
                                sx={{
                                    backgroundColor: '#3B82F6',
                                    color: '#ffffff',
                                    '&:hover': {
                                        backgroundColor: '#2563EB'
                                    },
                                    flexShrink: 0,
                                    height: '36px'
                                }}
                            >
                                Apply Range
                            </Button>
                        </Box>
                    )}

                    {/* Refresh Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            onClick={handleRefresh}
                            size="sm"
                            disabled={loading}
                            startDecorator={<RefreshRounded />}
                            sx={{
                                backgroundColor: '#ffffff',
                                color: '#000000',
                                '&:hover': {
                                    backgroundColor: '#e6e6e6'
                                },
                                '&:disabled': {
                                    backgroundColor: '#666666',
                                    color: '#cccccc'
                                }
                            }}
                        >
                            Refresh
                        </Button>
                    </Box>
                </Box>

                {loading && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: '#ffffff' }}>Loading...</Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography sx={{ color: '#EF4444' }}>Error: {error.message}</Typography>
                    </Box>
                )}

                {userCount.length > 0 && (
                    <Box sx={{ width: '100%' }}>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                data={userCount}
                                margin={{top: 5, right: 30, left: 20, bottom: 80}}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333333"
                                />
                                <XAxis
                                    dataKey="formattedTime"
                                    tick={{ fontSize: 11, fill: '#ffffff' }}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval={0}
                                    axisLine={{ stroke: '#666666' }}
                                    tickLine={{ stroke: '#666666' }}
                                />
                                <YAxis
                                    allowDecimals={false}
                                    tick={{ fontSize: 11, fill: '#ffffff' }}
                                    axisLine={{ stroke: '#666666' }}
                                    tickLine={{ stroke: '#666666' }}
                                />
                                <Tooltip content={<CustomTooltip/>}/>
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    dot={{fill: '#3B82F6', strokeWidth: 2, r: 4}}
                                    activeDot={{r: 6, stroke: '#3B82F6', strokeWidth: 2}}
                                />

                                <Brush
                                    dataKey="formattedTime"
                                    height={30}
                                    stroke="#3B82F6"
                                    fill="#2a2a2a"
                                    tickFormatter={(value) => ''}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}

                {!loading && !error && userCount.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography sx={{ color: '#888888' }}>
                            No data available for the selected time range
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default UserRegistrationGraph;
