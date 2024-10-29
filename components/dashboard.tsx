"use client"

import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer } from "@/components/ui/chart"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from 'lucide-react'

// Sample data generator
const generateSampleData = (roomNumber, date) => {
  const data = []
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i}:00`,
      temperature: Math.round((20 + Math.random() * 5 + Math.sin(i / 24 * Math.PI * 2) * 2) * 10) / 10,
      humidity: Math.round((50 + Math.random() * 10 + Math.cos(i / 24 * Math.PI * 2) * 5) * 10) / 10
    })
  }
  return data
}

const rooms = Array.from({ length: 10 }, (_, i) => `10${i}`)

export function DashboardComponent() {
  const [selectedRoom, setSelectedRoom] = useState('100')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const data = generateSampleData(selectedRoom, selectedDate)

  const currentData = rooms.map(room => ({
    room,
    ...generateSampleData(room, selectedDate)[23] // Get the last hour's data
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Room Environment Monitor</h1>
      
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={setSelectedRoom} defaultValue={selectedRoom}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map(room => (
              <SelectItem key={room} value={room}>Room {room}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date > new Date() || date < subDays(new Date(), 7)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Room {selectedRoom} - {format(selectedDate, "PPP")}</CardTitle>
          <CardDescription>Temperature and Humidity over 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              temperature: {
                label: "Temperature (°C)",
                color: "hsl(var(--chart-1))",
              },
              humidity: {
                label: "Humidity (%)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" orientation="left" stroke="var(--color-temperature)" />
                <YAxis yAxisId="right" orientation="right" stroke="var(--color-humidity)" />
                <Tooltip content={({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          {payload.map((entry) => (
            <div key={entry.name} className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                {entry.name}
              </span>
              <span className="font-bold text-muted-foreground">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="var(--color-temperature)" name="Temperature (°C)" />
                <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="var(--color-humidity)" name="Humidity (%)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Current Room Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentData.map(({ room, temperature, humidity }) => (
          <Card key={room}>
            <CardHeader>
              <CardTitle>Room {room}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Temperature: {temperature}°C</p>
              <p>Humidity: {humidity}%</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}