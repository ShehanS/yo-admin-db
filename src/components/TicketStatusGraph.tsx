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
                        labelColor: zone.labelColor || '#8884d8',
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
                        backgroundColor: 'background.surface',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'neutral.300',
                        borderRadius: 'sm',
                        boxShadow: 'md',
                    }}
                >
                    <Typography level="title-sm" sx={{ mb: 1 }}>
                        {label}
                    </Typography>
                    {payload.map((entry: any, index: number) => (
                        <Typography
                            key={index}
                            level="body-sm"
                            sx={{ color: entry.color }}
                        >
                            {`${entry.dataKey}: ${entry.value.toLocaleString()}`}
                        </Typography>
                    ))}
                </Box>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Typography>Loading zones data...</Typography>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Typography color="danger">Error loading zones: {error.message}</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <React.Fragment>
            <Card sx={{width:"50vw"}}>
                <CardContent>
                    <Typography level="h3" sx={{ mb: 3 }}>
                        Zone-wise Ticket Status by Event
                    </Typography>

                    {/* Chart */}
                    <Box sx={{ height: 400, mb: 4 }}>
                        <ResponsiveContainer height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    angle={-45}
                                    textAnchor="end"
                                    height={100}
                                    fontSize={12}
                                />
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Bar dataKey="maxTicket" fill="#3B82F6" name="Max Tickets" />
                                <Bar dataKey="remainingTicket" fill="#10B981" name="Remaining Tickets" />
                                <Bar dataKey="soldTicket" fill="#EF4444" name="Sold Tickets" />
                                <Bar dataKey="concertTicket" fill="#8B5CF6" name="Concert Tickets" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>

                    {/* Event Summary Cards */}
                    <Stack spacing={3}>
                        {processedData.map((eventData) => (
                            <Card key={eventData.eventId} variant="outlined">
                                <CardContent>
                                    <Typography level="h4" sx={{ mb: 2 }}>
                                        {eventData.eventId} - {eventData.eventDate}
                                    </Typography>

                                    {/* Event Totals */}
                                    <Box sx={{ mb: 3, p: 2, bgcolor: 'neutral.50', borderRadius: 'sm' }}>
                                        <Typography level="title-sm" sx={{ mb: 1 }}>
                                            Event Totals:
                                        </Typography>
                                        <Stack direction="row" spacing={3} flexWrap="wrap">
                                            <Box>
                                                <Typography level="body-xs" color="neutral">Max Tickets</Typography>
                                                <Typography level="title-md" color="primary">
                                                    {eventData.totalMaxTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" color="neutral">Remaining</Typography>
                                                <Typography level="title-md" color="success">
                                                    {eventData.totalRemainingTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" color="neutral">Sold</Typography>
                                                <Typography level="title-md" color="danger">
                                                    {eventData.totalSoldTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Typography level="body-xs" color="neutral">Concert</Typography>
                                                <Typography level="title-md" sx={{ color: '#8B5CF6' }}>
                                                    {eventData.totalConcertTicket.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    {/* Zone Details */}
                                    <Typography level="title-sm" sx={{ mb: 2 }}>
                                        Zone Breakdown:
                                    </Typography>
                                    <Stack direction="row" spacing={2} flexWrap="wrap">
                                        {Object.entries(eventData.zones).map(([zoneId, zoneData]) => (
                                            <Card key={zoneId} variant="soft" size="sm">
                                                <CardContent>
                                                    <Typography
                                                        level="title-sm"
                                                        sx={{
                                                            color: zoneData.labelColor,
                                                            mb: 1
                                                        }}
                                                    >
                                                        {zoneData.zoneName}
                                                    </Typography>
                                                    <Stack spacing={0.5}>
                                                        <Typography level="body-xs">
                                                            Max: {zoneData.maxTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs">
                                                            Remaining: {zoneData.remainingTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs">
                                                            Sold: {zoneData.soldTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs">
                                                            Concert: {zoneData.concertTicket.toLocaleString()}
                                                        </Typography>
                                                        <Typography level="body-xs" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                                                            Price: {zoneData.price.toLocaleString()}(LKR)
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
