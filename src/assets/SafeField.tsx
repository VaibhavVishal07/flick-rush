import { ShieldMark } from './icons'

/**
 * The Airtel Safe protective field: a soft ring that expands around the phone
 * when automation takes over.
 */
export const SafeField = ({ active }: { active: boolean }) => (
  <div className={`safe-field${active ? ' is-active' : ''}`} aria-hidden="true">
    <span className="safe-field__ring safe-field__ring--outer" />
    <span className="safe-field__ring safe-field__ring--mid" />
    <span className="safe-field__ring safe-field__ring--inner" />
    <span className="safe-field__pulse" />
    <span className="safe-field__badge">
      <ShieldMark size={15} />
    </span>
  </div>
)
