import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'

// Synthetic peg-deviation series. Real peg history is out of scope, but we
// encode each coin's known incidents so the chart tells an honest story.
// shape: [{ daysAgo: 60, deviation: 0.002, label?: 'optional' }, ...]
const PEG_SERIES = {
  usdc: {
    base: 0.0008,
    events: [{ day: 38, value: -0.12, label: 'SVB scare' }],
  },
  usdt: {
    base: 0.0012,
    events: [{ day: 22, value: -0.008 }],
  },
  dai: {
    base: 0.0009,
    events: [{ day: 38, value: -0.04, label: 'USDC contagion' }],
  },
  pyusd: {
    base: 0.0006,
    events: [],
  },
  usde: {
    base: 0.0015,
    events: [{ day: 14, value: -0.012 }],
  },
  fdusd: {
    base: 0.001,
    events: [{ day: 10, value: -0.06, label: 'Confidence dip' }],
  },
  crvusd: {
    base: 0.0011,
    events: [{ day: 27, value: -0.02 }],
  },
  tusd: {
    base: 0.0014,
    events: [
      { day: 45, value: -0.07, label: 'Reserve concerns' },
      { day: 18, value: -0.03 },
    ],
  },
}

// Deterministic pseudo-random based on coin id + day, so the chart is stable
// across re-renders.
function noise(seed, day) {
  const x = Math.sin(seed * 9301 + day * 49297) * 233280
  return x - Math.floor(x)
}

function seedFromId(id) {
  let s = 0
  for (let i = 0; i < id.length; i++) s = (s * 31 + id.charCodeAt(i)) | 0
  return Math.abs(s) || 1
}

function buildSeries(coinId) {
  const config = PEG_SERIES[coinId] || { base: 0.001, events: [] }
  const seed = seedFromId(coinId)
  const days = 60
  const eventByDay = new Map(config.events.map((e) => [e.day, e]))
  const points = []
  for (let d = days; d >= 0; d--) {
    const wobble = (noise(seed, d) - 0.5) * 2 * config.base
    let value = 1 + wobble
    const event = eventByDay.get(d)
    if (event) value = 1 + event.value
    points.push({
      day: d,
      label: `${d}d ago`,
      price: Number(value.toFixed(4)),
      event: event?.label,
    })
  }
  return points.reverse()
}

function TooltipBox({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const deviation = (p.price - 1) * 100
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-row">
        <strong>${p.price.toFixed(4)}</strong>
      </div>
      <div className="chart-tooltip-meta soft">{p.label}</div>
      <div className="chart-tooltip-meta soft">
        {deviation >= 0 ? '+' : ''}
        {deviation.toFixed(2)}% from peg
      </div>
      {p.event && <div className="chart-tooltip-meta">{p.event}</div>}
    </div>
  )
}

export default function PegChart({ coinId, color = '#0ea5a4' }) {
  const data = buildSeries(coinId)
  const min = Math.min(...data.map((p) => p.price))
  const max = Math.max(...data.map((p) => p.price))
  const pad = Math.max(0.005, (max - min) * 0.2)

  return (
    <div className="peg-chart">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="day"
            reversed
            tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
            tickFormatter={(d) => (d === 0 ? 'today' : `${d}d`)}
            interval="preserveStartEnd"
            stroke="var(--border)"
          />
          <YAxis
            domain={[min - pad, Math.max(max + pad, 1.01)]}
            tick={{ fontSize: 11, fill: 'var(--text-soft)' }}
            tickFormatter={(v) => `$${v.toFixed(3)}`}
            width={64}
            stroke="var(--border)"
          />
          <ReferenceLine
            y={1}
            stroke="var(--text-soft)"
            strokeDasharray="4 4"
            label={{
              value: '$1.00',
              position: 'right',
              fill: 'var(--text-soft)',
              fontSize: 11,
            }}
          />
          <Tooltip content={<TooltipBox />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="peg-chart-note muted small">
        Illustrative 60-day series. Real peg history is out of scope for the
        prototype — we encode known incidents so the chart tells an honest story.
      </p>
    </div>
  )
}
