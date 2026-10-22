import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Tabs } from '@/components/ui/Tabs';

const items = [
  { key: 'open', label: 'Open', content: <div>open panel</div> },
  { key: 'resolved', label: 'Resolved', content: <div>resolved panel</div> }
];

describe('Tabs', () => {
  it('renders the first tab by default', () => {
    render(<Tabs items={items} />);
    expect(screen.getByText('open panel')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Open' })).toHaveAttribute('aria-selected', 'true');
  });

  it('honours defaultValue', () => {
    render(<Tabs items={items} defaultValue="resolved" />);
    expect(screen.getByText('resolved panel')).toBeInTheDocument();
  });

  // Regression: the old Tabs had no onChange, so pages wrapped content in a
  // <div onClick> hack that never fired for the tab strip itself.
  it('fires onChange with the new key and switches panel (uncontrolled)', async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Resolved' }));

    expect(onChange).toHaveBeenCalledWith('resolved');
    expect(screen.getByText('resolved panel')).toBeInTheDocument();
  });

  it('is controlled when `value` is passed (caller owns the state)', async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="open" onChange={onChange} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Resolved' }));

    expect(onChange).toHaveBeenCalledWith('resolved');
    // Caller did not update `value`, so the panel must not change on its own.
    expect(screen.getByText('open panel')).toBeInTheDocument();
  });

  it('drives a filter when wired like the mentor/admin pages do', async () => {
    function Harness() {
      const [status, setStatus] = useState('open');
      return (
        <>
          <p data-testid="status">{status}</p>
          <Tabs
            items={[
              { key: 'open', label: 'Open', content: <div>o</div> },
              { key: 'resolved', label: 'Resolved', content: <div>r</div> }
            ]}
            value={status}
            onChange={(key) => setStatus(key)}
          />
        </>
      );
    }

    render(<Harness />);
    await userEvent.click(screen.getByRole('tab', { name: 'Resolved' }));
    expect(screen.getByTestId('status')).toHaveTextContent('resolved');
  });

  it('does not select a disabled tab', async () => {
    const onChange = vi.fn();
    render(
      <Tabs
        items={[
          { key: 'a', label: 'A', content: <div>a</div> },
          { key: 'b', label: 'B', content: <div>b</div>, disabled: true }
        ]}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole('tab', { name: 'B' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText('a')).toBeInTheDocument();
  });

  it('falls back to the first remaining tab when the active key disappears', () => {
    const { rerender } = render(<Tabs items={items} defaultValue="resolved" />);
    expect(screen.getByText('resolved panel')).toBeInTheDocument();

    rerender(<Tabs items={[items[0]]} defaultValue="resolved" />);
    expect(screen.getByText('open panel')).toBeInTheDocument();
  });
});
