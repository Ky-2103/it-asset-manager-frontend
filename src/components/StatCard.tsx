type Props = {
  label: string
  value: number
}

export function StatCard({ label, value }: Props) {
  return (
    <article className="stat-card">
      <p>{label}</p>
      <h3>{value}</h3>
    </article>
  )
}
