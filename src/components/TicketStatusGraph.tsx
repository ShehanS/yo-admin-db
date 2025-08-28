import React, {FC, useEffect, useState} from "react";
import {Box, Card, CardContent, Stack, Typography} from "@mui/joy";
import {useQuery} from "@apollo/client";
import {GET_ALL_ZONES} from "../graphql/queries";
import {ResponseMessage, ZoneConfig} from "../data/data";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

interface ProcessedZoneData {
    eventId: string;
    eventDate: string;
    zones: {
        [zoneId: string]: {
            zoneName: string;
            maxTicket: number;
            remainingTicket: number;
            soldTicket: number;
            concertTicket: number;
            price: number;
            labelColor: string;
        }
    };
    totalMaxTicket: number;
    totalRemainingTicket: number;
    totalSoldTicket: number;
    totalConcertTicket: number;
}

interface ChartData {
    name: string;
    eventId: string;
    eventDate: string;
    maxTicket: number;
    remainingTicket: number;
    soldTicket: number;
    concertTicket: number;
}

const TicketStatusGraph: FC = () => {
    const [zones, setZones] = useState<ZoneConfig[]>([]);
    const [processedData, setProcessedData] = useState<ProcessedZoneData[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);

    const {data, loading, error} = useQuery(GET_ALL_ZONES);

    useEffect(() => {
        const response = data?.getZones as ResponseMessage;
        if (response?.code === "CODE-700") {
            setZones(data?.getZones?.data);
        }
    }, [data]);

    useEffect(() => {
        if (zones.length > 0) {
            // Group zones by eventId
            const groupedByEvent = zones.reduce((acc: {[eventId: string]: ProcessedZoneData}, zone: ZoneConfig) => {
                if (!acc[zone.eventId]) {
                    acc[zone.eventId] = {
                        eventId: zone.eventId,
                        eventDate: zone.eventDateString || zone.eventDate,
                        zones: {},
                        totalMaxTicket: 0,
                        totalRemainingTicket: 0,
                        totalSoldTicket: 0,
                        totalConcertTicket: 0,
                    };
                }

                // Add zone data
                if (!acc[zone.eventId].zones[zone.zoneId]) {
                    acc[zone.eventId].zones[zone.zoneId] = {
                        zoneName: zone.name,
                        maxTicket: 0,
                        remainingTicket: 0,
                        soldTicket: 0,
                        concertTicket: 0,
                        price: zone.price,
                        labelColor: zone.labelColor || '#ffffff',
                    };
                }

                // Accumulate tickets for this zone
                acc[zone.eventId].zones[zone.zoneId].maxTicket += zone.maxTicket;
                acc[zone.eventId].zones[zone.zoneId].remainingTicket += zone.remainingTicket;
                acc[zone.eventId].zones[zone.zoneId].soldTicket += zone.soldTicket;
                acc[zone.eventId].zones[zone.zoneId].concertTicket += zone.concertTicket || 0;

                // Update event totals
                acc[zone.eventId].totalMaxTicket += zone.maxTicket;
                acc[zone.eventId].totalRemainingTicket += zone.remainingTicket;
                acc[zone.eventId].totalSoldTicket += zone.soldTicket;
                acc[zone.eventId].totalConcertTicket += zone.concertTicket || 0;

                return acc;
            }, {});

            setProcessedData(Object.values(groupedByEvent));

            // Create chart data for visualization
            const chartDataArray: ChartData[] = [];

            Object.values(groupedByEvent).forEach((event) => {
                // Add event totals
                chartDataArray.push({
                    name: `${event.eventId} (Total)`,
                    eventId: event.eventId,
                    eventDate: event.eventDate,
                    maxTicket: event.totalMaxTicket,
                    remainingTicket: event.totalRemainingTicket,
                    soldTicket: event.totalSoldTicket,
                    concertTicket: event.totalConcertTicket,
                });

                // Add individual zones
                Object.entries(event.zones).forEach(([zoneId, zoneData]) => {
                    chartDataArray.push({
                        name: `${event.eventId} - ${zoneData.zoneName}`,
                        eventId: event.eventId,
                        eventDate: event.eventDate,
                        maxTicket: zoneData.maxTicket,
                        remainingTicket: zoneData.remainingTicket,
                        soldTicket: zoneData.soldTicket,
                        concertTicket: zoneData.concertTicket,
                    });
                });
            });

            setChartData(chartDataArray);
        }
    }, [zones]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <Box
                    sx={{
                        backgroundColor: '#1a1a1a',
                        p: 2,
                        border: '1px solid #333333',
                        borderRadius: 'sm',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.1)',
                        color: '#ffffff'
                    }}
                >
                    <Typography level="title-sm" sx={{ mb: 1, color: '#ffffff' }}>
                        {label}
                    </Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography
                            key={index}
                            level="body-sm"
                            sx={{ color: entry.color, mb: 0.5 }}
                        >
                            {`${entry.dataKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${entry.value.toLocaleString()}`}
                        </Typography>
                    ))}
                </Box>
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
                        <Typography sx={{ color: '#ffffff' }}>Loading ticket status data...</Typography>
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
                            Error loading zones: {error.message}
                        </Typography>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <React.Fragment>
            <Card sx={{
                width: "100%",
                backgroundColor: '#000000',
                border: '1px solid #333333',
                boxShadow: 'none'
            }}>
                <CardContent>
                    <Typography level="h3" sx={{ mb: 3, color: '#ffffff', fontWeight: 'bold' }}>
                        Zone-wise Ticket Status by Event
                    </Typography>

                    {/* Chart */}
                    <Box sx={{ height: 400, mb: 4 }}>
                        <ResponsiveContainer height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#333333"
                                />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={12}
                                    tick={{ fill: '#ffffff' }}
                                    axisLine={{ stroke: '#666666' }}
                                    tickLine={{ stroke: '#666666' }}
                                />
                                <YAxis
                                    tick={{ fill: '#ffffff' }}
                                    axisLine={{ stroke: '#666666' }}
                                    tickLine={{ stroke: '#666666' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    wrapperStyle={{ color: '#ffffff' }}
                                    iconType="rect"
                                />
                                <Bar
                                    dataKey="maxTicket"
                                    fill="#3B82F6"
                                    name="Max Tickets"
                                    stroke="#333333"
                                    strokeWidth={1}
                                />
                                <Bar
                                    dataKey="remainingTicket"
                                    fill="#10B981"
                                    name="Remaining Tickets"
                                    stroke="#333333"
                                    strokeWidth={1}
                                />
                                <Bar
                                    dataKey="soldTicket"
                                    fill="#EF4444"
                                    name="Sold Tickets"
                                    stroke="#333333"
                                    strokeWidth={1}
                                />
                                <Bar
                                    dataKey="concertTicket"
                                    fill="#8B5CF6"
                                    name="Concert Tickets"
                                    stroke="#333333"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Event Summary Cards */}
                    <Stack spacing={3}>
                        {processedData.map((eventData) => (
                            <Card
                                key={eventData.eventId}
                                sx={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333333'
                                }}
                            >
                                <CardContent>
                                    <Typography level="h4" sx={{ mb: 2, color: '#ffffff' }}>
                                        {eventData.eventId} - {eventData.eventDate}
                                    </Typography>

                                    {/* Event Totals */}
                                    <Box sx={{
                                        mb: 3,
                                        p: 2,
                                        backgroundColor: '#2a2a2a',
                                        borderRadius: 'sm',
                                        border: '1px solid #444444'
                                    }}>
                                        <Typography level="title-sm" sx={{ mb: 1, color: '#ffffff' }}>
                                            Event Totals:
                                        </Typography>
                                        <Stack direction="row" spacing={3} flexWrap="wrap">
                                            <Box>
                                                <Typography level="body-xs" sx={{ color: '#cccccc' }}>Max Tickets</Typography>
                                                <Typography level="title-md" sx={{ color: '#3B82F6' }}>
                                                    {eventData.totalMaxTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" sx={{ color: '#cccccc' }}>Remaining</Typography>
                                                <Typography level="title-md" sx={{ color: '#10B981' }}>
                                                    {eventData.totalRemainingTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" sx={{ color: '#cccccc' }}>Sold</Typography>
                                                <Typography level="title-md" sx={{ color: '#EF4444' }}>
                                                    {eventData.totalSoldTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" sx={{ color: '#cccccc' }}>Concert</Typography>
                                                <Typography level="title-md" sx={{ color: '#8B5CF6' }}>
                                                    {eventData.totalConcertTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Zone Details */}
                                    <Typography level="title-sm" sx={{ mb: 2, color: '#ffffff' }}>
                                        Zone Breakdown:
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {Object.entries(eventData.zones).map(([zoneId, zoneData]) => (
                                            <Card
                                                key={zoneId}
                                                sx={{
                                                    backgroundColor: '#2a2a2a',
                                                    border: '1px solid #444444',
                                                    minWidth: '200px'
                                                }}
                                                size="sm"
                                            >
                                                <CardContent>
                                                    <Typography
                                                        level="title-sm"
                                                        sx={{
                                                            color: '#ffffff',
                                                            mb: 1,
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        {zoneData.zoneName}
                                                    </Typography>
                                                    <Stack spacing={0.5}>
                                                        <Typography level="body-xs" sx={{ color: '#cccccc' }}>
                                                            Max: {zoneData.maxTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs" sx={{ color: '#cccccc' }}>
                                                            Remaining: {zoneData.remainingTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs" sx={{ color: '#cccccc' }}>
                                                            Sold: {zoneData.soldTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs" sx={{ color: '#cccccc' }}>
                                                            Concert: {zoneData.concertTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs" sx={{
                                                            fontWeight: 'bold',
                                                            mt: 0.5,
                                                            color: '#ffffff',
                                                            backgroundColor: '#3a3a3a',
                                                            p: 0.5,
                                                            borderRadius: 'xs'
                                                        }}>
                                                            Price: {zoneData.price.toLocaleString()} LKR
                                                        </Typography>
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </React.Fragment>
    );
};

export default TicketStatusGraph;
