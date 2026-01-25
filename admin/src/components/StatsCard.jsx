import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * StatsCard - Reusable statistics card component for dashboard
 * 
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.description - Additional description text
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {number} props.change - Percentage change (positive or negative)
 * @param {string} props.changeLabel - Label for the change (e.g., "from last month")
 * @param {string} props.trend - Manual trend direction: 'up', 'down', or 'neutral'
 * @param {string} props.className - Additional CSS classes
 */
const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  change,
  changeLabel = "from last period",
  trend,
  className,
}) => {
  // Determine trend direction
  const getTrend = () => {
    if (trend) return trend
    if (change === undefined || change === null) return null
    if (change > 0) return 'up'
    if (change < 0) return 'down'
    return 'neutral'
  }

  const currentTrend = getTrend()

  const getTrendIcon = () => {
    switch (currentTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      case 'neutral':
        return <Minus className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (currentTrend) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {(change !== undefined || currentTrend) && (
          <div className="flex items-center gap-1 mt-2">
            {getTrendIcon()}
            {change !== undefined && (
              <span className={cn("text-xs font-medium", getTrendColor())}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            )}
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StatsCard
