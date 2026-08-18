import { AirtelSafeMark, LinkIcon, MessageIcon, ThreatCallIcon } from '../assets/icons'
import { safetyReport } from '../game/gameConfig'

/**
 * Where the CTA lands today. Reads the same `safetyReport` object the
 * ingress personalises from, so swapping in the real feed changes both.
 */
export const SafetyReportSheet = ({ onClose }: { onClose: () => void }) => {
  const report = safetyReport
  const rows = report
    ? [
        { label: 'Spam calls', value: report.spamCalls, icon: <ThreatCallIcon size={17} /> },
        { label: 'Spam messages', value: report.spamMessages, icon: <MessageIcon size={17} /> },
        { label: 'Suspicious links', value: report.suspiciousLinks, icon: <LinkIcon size={17} /> },
      ]
    : []

  return (
    <div className="sheet" role="dialog" aria-modal="true" aria-label="Your safety report">
      <button type="button" className="sheet__scrim" onClick={onClose} aria-label="Close" />
      <div className="sheet__panel">
        <h2 className="sheet__title">This week</h2>
        <div className="report">
          <AirtelSafeMark />
          <p className="report__lede">
            {report ? (
              <>
                Airtel Safe handled <b>{report.totalHandled} things</b> for you this week.
              </>
            ) : (
              <>Airtel Safe is watching out for you in the background.</>
            )}
          </p>

          <ul className="report__list">
            {rows.map((r) => (
              <li key={r.label}>
                <span className="report__icon">{r.icon}</span>
                <span className="report__label">{r.label}</span>
                <span className="report__value">{r.value}</span>
              </li>
            ))}
          </ul>

          <p className="report__foot">No taps needed. It just happens.</p>
        </div>

        <div className="sheet__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
