export function Button(props: {
  className?: string
  onClick?: () => void
  color: 'green' | 'red' | 'deemphasized'
  hideFocusRing?: boolean
  children?: any
}) {
  const { className, onClick, children, color, hideFocusRing } = props

  return (
    <button
      type="button"
      className={classNames(
        'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white',
        !hideFocusRing && 'focus:outline-none focus:ring-2 focus:ring-offset-2',
        color === 'green' &&
          'bg-green-500 hover:bg-green-600 focus:ring-green-500',
        color === 'red' && 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
        color === 'deemphasized' &&
          'bg-transparent hover:bg-gray-600 focus:ring-gray-400',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}
