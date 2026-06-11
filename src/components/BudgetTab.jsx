import { Alert } from './shared.jsx';

export default function BudgetTab({ data, updateData }) {
  const updateBudgetItem = (itemId, field, value) => {
    updateData(prev => ({
      ...prev,
      budget: prev.budget.map(b =>
        b.id === itemId ? { ...b, [field]: value } : b
      ),
    }));
  };

  // Calculate totals
  const totalActual = data.budget
    .filter(b => b.actual && b.actual !== '—' && b.actual !== 'TBD' && b.actual !== '')
    .reduce((sum, b) => {
      const num = parseFloat(b.actual.replace(/[^0-9.]/g, ''));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);

  return (
    <>
      <h2 className="section-heading">Budget Tracker</h2>
      <p className="section-desc">Target budget: $20,000–30,000 · ~80–100 guests · Los Angeles</p>

      <table className="budget-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Estimated</th>
            <th>Actual / Committed</th>
            <th>Notes</th>
            <th>% of Budget</th>
          </tr>
        </thead>
        <tbody>
          {data.budget.map(item => (
            <tr key={item.id}>
              <td className="category">{item.category}</td>
              <td className="amount-est">{item.estimated}</td>
              <td>
                {item.category === 'Contingency' ? (
                  <span className="amount-actual">—</span>
                ) : (
                  <input
                    type="text"
                    className="budget-input"
                    value={item.actual || ''}
                    onChange={e => updateBudgetItem(item.id, 'actual', e.target.value)}
                    placeholder="$0"
                  />
                )}
              </td>
              <td>
                <input
                  type="text"
                  className="budget-input"
                  value={item.notes || ''}
                  onChange={e => updateBudgetItem(item.id, 'notes', e.target.value)}
                  placeholder="Notes..."
                  style={{ fontSize: 11 }}
                />
              </td>
              <td>
                <div className="pct-bar">
                  <div className="mini-bar">
                    <div className="mini-bar-fill" style={{ width: `${item.pct}%` }} />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{item.pct}%</span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="total-row">
            <td className="category">Total Committed</td>
            <td className="amount-est">$21,900–45,200</td>
            <td className="amount-actual">${totalActual.toLocaleString()}</td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <Alert type="warn" icon="⚠">
        <strong>The math is tight but doable:</strong> Dropping to 80–100 guests is the single biggest win — versus 150, that's roughly $5–8k less in food & beverage alone. To stay in the $20–30k band, lean on a low-fee or open-catering venue.
      </Alert>
    </>
  );
}
