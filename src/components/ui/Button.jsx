export default function Button({ children, variant = 'primary', className = '', ...props }) {
  let baseClass = '';
  
  if (variant === 'primary') baseClass = 'btn-primary';
  else if (variant === 'ghost') baseClass = 'btn-ghost';
  else if (variant === 'danger') baseClass = 'btn-danger';

  return (
    <button className={`${baseClass} ${className}`} {...props}>
      {children}
    </button>
  );
}
