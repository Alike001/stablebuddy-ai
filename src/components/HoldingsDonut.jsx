import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatUsd } from '../utils/format.js'

function TooltipBox({ active, payload }) {
  if (!active || !payload?.length) return null
  const slice = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-row">
        <span className="chart-tooltip-dot" style={{ background: slice.color }} />
        <strong>{slice.symbol}</strong>
      </div>
      <div className="chart-tooltip-meta">{formatUsd(slice.value)}</div>
      <div className="chart-tooltip-meta soft">{slice.percent.toFixed(1)}%</div>
    </div>
  )
}

export default function HoldingsDonut({ data }) {
  if (!data || data.length === 0) {
    return null
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)
  const enriched = data.map((d) => ({
    ...d,
    percent: total > 0 ? (d.value / total) * 100 : 0,
  }))

  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enriched}
            dataKey="value"
            nameKey="symbol"
            innerRadius="60%"
            outerRadius="90%"
            paddingAngle={2}
            stroke="none"
          >
            {enriched.map((d) => (
              <Cell key={d.symbol} fill={d.color} />
            ))}
          </Pie>
          <Tooltip content={<TooltipBox />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <div className="donut-center-label">Total</div>
        <div className="donut-center-value">{formatUsd(total)}</div>
      </div>
    </div>
  )
}
