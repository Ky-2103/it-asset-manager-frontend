type Props = {
  navigate: (to: string) => void
}

export function LandingPage({ navigate }: Props) {
  return (
    <section className="panel center">
      <h1>IT Asset & Maintenance Management System</h1>
      <p>
        Track devices, manage assignments, and streamline maintenance requests through a clean role-based
        workflow.
      </p>
      <div className="actions">
        <button onClick={() => navigate('/login')}>Login</button>
        <button className="secondary" onClick={() => navigate('/register')}>
          Register
        </button>
      </div>
    </section>
  )
}
