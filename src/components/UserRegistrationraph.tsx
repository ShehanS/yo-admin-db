import React, {FC, useEffect, useState} from "react";
import {Brush, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {useLazyQuery} from "@apollo/client";
import {GET_USER_COUNT_30MIN_BUCKETS_IN_RANGE} from "../graphql/queries";
import {ResponseMessage, UserData5Min} from "../data/data";
import {Button, Dropdown, FormControl, FormLabel, Menu, MenuButton, MenuItem} from "@mui/joy";
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
            label: "Last 90 Days",
            value: "90d",
            startTime: () => Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000),
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
        loadDataForTimeRange();
    }, [selectedTimeRange]);

    useEffect(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        setCustomEndDate(now.toISOString().slice(0, 16));
        setCustomStartDate(weekAgo.toISOString().slice(0, 16));
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
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="text-sm font-medium">{`Time: ${data.formattedDate}`}</p>
                    <p className="text-sm font-bold text-blue-600">{`Users: ${data.count}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full">
            <div className="w-full mb-4">
                {selectedTimeRange !== "custom" ? (
                    <div className="flex flex-row items-end justify-between gap-4 flex-wrap">
                        <FormControl className="min-w-48">
                            <FormLabel>Time Range</FormLabel>
                            <Dropdown>
                                <MenuButton
                                    variant="outlined"
                                    size="sm"
                                    startDecorator={<DateRangeRounded/>}
                                    endDecorator={<KeyboardArrowDown/>}
                                >
                                    {getCurrentTimeRange().label}
                                </MenuButton>
                                <Menu>
                                    {timeRanges.map((range) => (
                                        <MenuItem
                                            key={range.value}
                                            onClick={() => handleTimeRangeChange(range.value)}
                                            selected={selectedTimeRange === range.value}
                                        >
                                            {range.label}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Dropdown>
                        </FormControl>

                        <Button onClick={handleRefresh} size="sm" disabled={loading}>
                            <RefreshRounded/>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="flex flex-row items-end justify-between gap-4">
                            <FormControl className="min-w-48">
                                <FormLabel>Time Range</FormLabel>
                                <Dropdown>
                                    <MenuButton
                                        variant="outlined"
                                        size="sm"
                                        startDecorator={<DateRangeRounded/>}
                                        endDecorator={<KeyboardArrowDown/>}
                                    >
                                        {getCurrentTimeRange().label}
                                    </MenuButton>
                                    <Menu>
                                        {timeRanges.map((range) => (
                                            <MenuItem
                                                key={range.value}
                                                onClick={() => handleTimeRangeChange(range.value)}
                                                selected={selectedTimeRange === range.value}
                                            >
                                                {range.label}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Dropdown>
                            </FormControl>

                            <Button onClick={handleRefresh} size="sm" disabled={loading}>
                                <RefreshRounded/>
                            </Button>
                        </div>

                        <div className="flex flex-row items-end gap-4 flex-wrap">
                            <FormControl className="flex-1 min-w-48">
                                <FormLabel>Start Date & Time</FormLabel>
                                <input
                                    type="datetime-local"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    onBlur={handleCustomDateChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
                                />
                            </FormControl>
                            <FormControl className="flex-1 min-w-48">
                                <FormLabel>End Date & Time</FormLabel>
                                <input
                                    type="datetime-local"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    onBlur={handleCustomDateChange}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-8"
                                />
                            </FormControl>
                            <Button
                                onClick={handleCustomDateChange}
                                size="sm"
                                variant="outlined"
                                className="shrink-0"
                            >
                                Apply Range
                            </Button>
                        </div>
                    </div>
                )}
            </div>


            {loading && <div className="text-center py-4">Loading...</div>}
            {error && <div className="text-red-500 text-center py-4">Error: {error.message}</div>}

            {userCount.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                        data={userCount}
                        margin={{top: 5, right: 30, left: 20, bottom: 80}}
                    >
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis
                            dataKey="formattedTime"
                            tick={{fontSize: 11}}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                        />
                        <YAxis
                            allowDecimals={false}
                            tick={{fontSize: 11}}
                        />
                        <Tooltip content={<CustomTooltip/>}/>
                        <Line
                            type="monotone"
                            dataKey="count"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={{fill: '#8884d8', strokeWidth: 2, r: 4}}
                            activeDot={{r: 6, stroke: '#8884d8', strokeWidth: 2}}
                        />

                        <Brush
                            dataKey="formattedTime"
                            height={30}
                            stroke="#8884d8"
                            fill="#f0f0f0"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {!loading && !error && userCount.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                    No data available for the selected time range
                </div>
            )}
        </div>
    );
};

export default UserRegistrationGraph;
